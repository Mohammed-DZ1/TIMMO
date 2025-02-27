import React from 'react';
import { Menu } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';

const AddNewButton = ({ onSelect }) => {
  return (
    <div className="relative">
      <Menu as="div">
        <Menu.Button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New
        </Menu.Button>
        <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } group flex items-center w-full px-4 py-2 text-sm`}
                  onClick={() => onSelect('client')}
                >
                  New Client
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } group flex items-center w-full px-4 py-2 text-sm`}
                  onClick={() => onSelect('property')}
                >
                  New Property
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Menu>
    </div>
  );
};

export default AddNewButton;
