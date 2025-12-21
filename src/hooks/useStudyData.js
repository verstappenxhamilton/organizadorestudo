import { useState, useEffect } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';
import { ensureGlobalEditais } from '../utils/editalManager';
import {
    isNameStudiedInProgress,
    loadGlobalProgress,
    saveGlobalProgress,
    updateProgressForName
} from '../utils/progressRegistry';

/**
 * Custom hook to manage all study-related data (profiles, subjects, sessions, etc.)
 */
export const useStudyData = (showToast) => {
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [studyProfiles, setStudyProfiles] = useState([]);
    const [activeProfileId, setActiveProfileId] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [studySessions, setStudySessions] = useState([]);
    const [syllabusItems, setSyllabusItems] = useState([]);

    // Load initial data
    useEffect(() => {
        const initializeApp = async () => {
            try {
                setIsLoading(true);
                ensureGlobalEditais();
                const savedProfiles = loadFromLocalStorage("studyProfiles") || [];
                const savedActiveProfileId = loadFromLocalStorage("activeProfileId");
                const savedSubjects = loadFromLocalStorage("subjects") || [];
                const savedSessions = loadFromLocalStorage("sessions") || [];
                const savedSyllabusItems = loadFromLocalStorage("syllabusItems") || [];
                const globalProgress = loadGlobalProgress();

                const normalizedItems = (Array.isArray(savedSyllabusItems) ? savedSyllabusItems : []).map((item) => {
                    if (!item?.name) return item;
                    if (item.isStudied) return item;
                    if (isNameStudiedInProgress(item.name, globalProgress)) {
                        return { ...item, isStudied: true };
                    }
                    return item;
                });

                setStudyProfiles(savedProfiles);
                setSubjects(savedSubjects);
                setStudySessions(savedSessions);
                setSyllabusItems(normalizedItems);
                if (normalizedItems.length > 0) {
                    saveToLocalStorage("syllabusItems", normalizedItems);
                }

                if (savedProfiles.length > 0) {
                    setActiveProfileId(savedActiveProfileId || savedProfiles[0].id);
                }
            } catch (error) {
                console.error("Init Error", error);
                if (showToast) showToast("Erro ao carregar dados", "error");
            } finally {
                setIsLoading(false);
            }
        };
        initializeApp();
    }, []);

    // -- CRUD ACTIONS --

    const setActiveProfile = (id) => {
        setActiveProfileId(id);
        saveToLocalStorage("activeProfileId", id);
    };

    const addOrUpdateProfile = (profileData, editingId = null) => {
        const newProfiles = editingId
            ? studyProfiles.map((p) =>
                p.id === editingId ? { ...p, ...profileData } : p,
            )
            : [
                ...studyProfiles,
                {
                    id: Date.now().toString(),
                    ...profileData,
                    createdAt: new Date().toISOString(),
                },
            ];

        setStudyProfiles(newProfiles);
        saveToLocalStorage("studyProfiles", newProfiles);

        if (!editingId) {
            const newId = newProfiles[newProfiles.length - 1].id;
            setActiveProfileId(newId);
            saveToLocalStorage("activeProfileId", newId);
        }

        return editingId ? 'atualizado' : 'criado';
    };

    const deleteProfile = (id) => {
        const newProfiles = studyProfiles.filter((p) => p.id !== id);
        setStudyProfiles(newProfiles);
        saveToLocalStorage("studyProfiles", newProfiles);
        if (activeProfileId === id) setActiveProfile(newProfiles[0]?.id || null);
    };

    const addOrUpdateSubject = (subjectData, editingId = null) => {
        const newSubjects = editingId
            ? subjects.map((s) =>
                s.id === editingId ? { ...s, ...subjectData } : s,
            )
            : [
                ...subjects,
                { id: Date.now().toString(), profileId: activeProfileId, ...subjectData },
            ];

        setSubjects(newSubjects);
        saveToLocalStorage("subjects", newSubjects);
    };

    const deleteSubject = (id) => {
        const newSubjects = subjects.filter((s) => s.id !== id);
        setSubjects(newSubjects);
        saveToLocalStorage("subjects", newSubjects);

        // Cleanup related items
        const newItems = syllabusItems.filter((i) => i.subjectId !== id);
        setSyllabusItems(newItems);
        saveToLocalStorage("syllabusItems", newItems);

        const newSessions = studySessions.filter((s) => s.subjectId !== id);
        setStudySessions(newSessions);
        saveToLocalStorage("sessions", newSessions);
    };

    const addOrUpdateSession = (sessionDataRaw, editingId = null) => {
        const { markTopicStudied, ...sessionData } = sessionDataRaw || {};

        const newSessions = editingId
            ? studySessions.map((s) =>
                s.id === editingId ? { ...s, ...sessionData } : s,
            )
            : [
                ...studySessions,
                {
                    id: Date.now().toString(),
                    profileId: activeProfileId,
                    ...sessionData,
                },
            ];

        setStudySessions(newSessions);
        saveToLocalStorage("sessions", newSessions);

        // Handle Syllabus Item Updates (Mark Studied OR Next Review Date)
        if (sessionData.syllabusItemId) {
            setSyllabusItems((prev) => {
                let updated = prev.map((i) => {
                    if (i.id !== sessionData.syllabusItemId) return i;

                    const updates = {};
                    if (markTopicStudied) updates.isStudied = true;
                    if (sessionData.nextReviewDate) updates.nextReviewDate = sessionData.nextReviewDate;

                    return Object.keys(updates).length > 0 ? { ...i, ...updates } : i;
                });

                let progressMap = loadGlobalProgress();
                if (markTopicStudied) {
                    const item = updated.find((i) => i.id === sessionData.syllabusItemId);
                    if (item?.name) {
                        progressMap = updateProgressForName(item.name, progressMap, true);
                        saveGlobalProgress(progressMap);
                    }
                }

                if (markTopicStudied) {
                    updated = updated.map((item) => {
                        if (!item?.name) return item;
                        return {
                            ...item,
                            isStudied: isNameStudiedInProgress(item.name, progressMap)
                        };
                    });
                }

                // Only save if changed (optimization, but map always returns new array so simple save)
                saveToLocalStorage("syllabusItems", updated);
                return updated;
            });
        }
    };

    const deleteSession = (sessionId) => {
        const newSessions = studySessions.filter((s) => s.id !== sessionId);
        setStudySessions(newSessions);
        saveToLocalStorage("sessions", newSessions);
    };

    const updateSyllabusItem = (itemId, updates) => {
        setSyllabusItems((prev) => {
            let updated = prev.map((i) =>
                i.id === itemId ? { ...i, ...updates } : i,
            );

            if (Object.prototype.hasOwnProperty.call(updates || {}, 'isStudied')) {
                const item = updated.find((i) => i.id === itemId);
                if (item?.name) {
                    const progressMap = loadGlobalProgress();
                    const nextMap = updateProgressForName(item.name, progressMap, updates.isStudied);
                    saveGlobalProgress(nextMap);
                    updated = updated.map((currentItem) => {
                        if (!currentItem?.name) return currentItem;
                        return {
                            ...currentItem,
                            isStudied: isNameStudiedInProgress(currentItem.name, nextMap)
                        };
                    });
                }
            }

            saveToLocalStorage("syllabusItems", updated);
            return updated;
        });
    };

    return {
        isLoading,
        studyProfiles,
        activeProfileId,
        subjects,
        studySessions,
        syllabusItems,

        // Setters (exposed nicely)
        setStudyProfiles,
        setSubjects,
        setStudySessions,
        setSyllabusItems,
        setActiveProfileId: setActiveProfile, // use the wrapper

        // Actions
        addOrUpdateProfile,
        deleteProfile,
        addOrUpdateSubject,
        deleteSubject,
        addOrUpdateSession,
        deleteSession,
        updateSyllabusItem
    };
};
