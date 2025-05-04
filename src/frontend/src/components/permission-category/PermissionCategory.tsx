import React, { useState } from 'react';
import './permission-category.css';

interface PermissionCategoryProps {
    category: string;
    permissions: { label: string; description: string; value: string }[];
    selectedPermissions: string[];
    onChange: (value: string) => void;
}


function PermissionCategory({category, permissions, selectedPermissions, onChange}: PermissionCategoryProps) {

    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen((prev) => !prev);

    return (
        <div className="permission-category">
            <div className="category-header" onClick={toggleOpen}>
                <span>{category}</span>
                <span className={`arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </div>
            <div className={`category-content ${isOpen ? 'open' : ''}`}>
                {permissions.map((perm) => (
                    <label key={perm.value} className="permission-item">
                        <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm.value)}
                            onChange={() => onChange(perm.value)}
                        />
                        <span>{perm.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default PermissionCategory;
