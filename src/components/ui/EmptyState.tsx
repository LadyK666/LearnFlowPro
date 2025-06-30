import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './button';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    to?: string;
    icon?: React.ElementType;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
  const renderAction = () => {
    if (!action) return null;
    
    const ActionIcon = action.icon;

    if (action.to) {
      return (
        <Button asChild>
          <Link to={action.to}>
            {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
            {action.label}
          </Link>
        </Button>
      );
    }

    if (action.onClick) {
      return (
        <Button onClick={action.onClick}>
          {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
          {action.label}
        </Button>
      );
    }
    
    return null;
  };

  return (
    <div className="text-center py-12">
      <Icon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm mx-auto">{description}</p>
      {renderAction()}
    </div>
  );
}; 