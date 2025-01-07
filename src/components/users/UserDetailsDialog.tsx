import React from 'react';
import { X } from 'lucide-react';
import { User } from '../../types/user';
import { useGetUserByIdQuery } from '../../services/userApi';

interface UserDetailsDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<User>) => void;
}

export default function UserDetailsDialog({ user, isOpen, onClose, onSave }: UserDetailsDialogProps) {
  const [formData, setFormData] = React.useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    isDisabled: false,
    isLockedOut: false,
    roles: [] as number[]
  });
  
  const { data: userDetails, isLoading, isSuccess } = useGetUserByIdQuery(user?.id ?? 0, { 
    skip: !user?.id,
    refetchOnMountOrArgChange: true
  });

  React.useEffect(() => {
    if (isSuccess && userDetails) {
      console.log('Setting form data with:', userDetails);
      setFormData({
        email: userDetails.email,
        firstName: userDetails.firstName || '',
        lastName: userDetails.lastName || '',
        phoneNumber: userDetails.phoneNumber || '',
        isDisabled: userDetails.isDisabled || false,
        isLockedOut: userDetails.isLockedOut || false,
        roles: Array.isArray(userDetails.roles) ? userDetails.roles : [2]
      });
    }
  }, [isSuccess, userDetails]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    onSave({
      userId: user.id,
      email: formData.email,
      ...formData
    });
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
          <p className="text-gray-500 dark:text-gray-400">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full shadow-xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            User Details
            {userDetails.isLockedOut && (
              <span className="ml-2 text-sm font-normal text-red-600 dark:text-red-400">
                (Account Locked)
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+44"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDisabled"
                checked={formData.isDisabled}
                onChange={(e) => setFormData({ ...formData, isDisabled: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isDisabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Disable User
              </label>
            </div>

            {userDetails.isLockedOut && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isLockedOut"
                  checked={!formData.isLockedOut}
                  onChange={(e) => setFormData({ ...formData, isLockedOut: !e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isLockedOut" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Reset Account Lockout
                </label>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <select
              value={formData.roles.includes(1) ? 'admin' : 'viewer'}
              onChange={(e) => setFormData({ 
                ...formData, 
                roles: e.target.value === 'admin' ? [1, 2] : [2]
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}