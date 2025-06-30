import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/Auth/AuthForm';
import { UserPlus } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate('/login'); // 注册成功后跳转到登录页
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-extrabold text-blue-600">LearnFlow Pro</h1>
          <UserPlus className="mx-auto h-12 w-auto text-blue-600" />
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              创建您的新账户
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              已经有账户了？{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  前往登录
              </Link>
          </p>
        </div>
        <AuthForm mode="register" onSuccess={handleRegisterSuccess} />
      </div>
    </div>
  );
};

export default RegisterPage; 