import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/Auth/AuthForm';
import { CheckSquare } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/'); // 登录成功后跳转到首页
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-extrabold text-blue-600">LearnFlow Pro</h1>
          <CheckSquare className="mx-auto h-12 w-auto text-blue-600" />
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              登录您的账户
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              还没有账户？{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  立即注册
              </Link>
          </p>
        </div>
        <AuthForm mode="login" onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginPage; 