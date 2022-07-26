import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isExistToken } from 'util/useful-functions';

const PrivateRoute = () => {
  if (isExistToken()) return <Outlet />;
  return <Navigate to='/login' />;
};

export default PrivateRoute;
