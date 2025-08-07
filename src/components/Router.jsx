import App from '../App.jsx';
import AdminPage from '../pages/AdminPage.jsx';

const Router = () => {
  const currentPath = window.location.pathname;

  const renderComponent = () => {
    switch (currentPath) {
      case '/admin':
        return <AdminPage />;
      default:
        return <App />;
    }
  };

  return renderComponent();
};

export default Router;
