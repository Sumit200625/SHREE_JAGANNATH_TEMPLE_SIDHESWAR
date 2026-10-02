import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// Pre-seeded users in mock database
const MOCK_USERS = [
  { id: "usr_1", name: "Prakash Chandra Rath", email: "admin@siddheswar.org", phone: "9437199999", role: "super_admin", password: "password123" },
  { id: "usr_2", name: "Rama Chandra Mishra", email: "seva@siddheswar.org", phone: "9437188888", role: "seva_manager", password: "password123" },
  { id: "usr_3", name: "Suresh Kumar Sahu", email: "donation@siddheswar.org", phone: "9437177777", role: "donation_manager", password: "password123" },
  { id: "usr_4", name: "Binod Bihari Mahapatra", email: "editor@siddheswar.org", phone: "9437166666", role: "content_editor", password: "password123" },
  { id: "usr_5", name: "Kartik Nayak", email: "notice@siddheswar.org", phone: "9437155555", role: "notice_manager", password: "password123" },
  { id: "usr_6", name: "Debasis Devotee", email: "devotee@gmail.com", phone: "9876543210", role: "devotee", password: "user123", gotra: "Kashyap", address: "Digapahandi, Ganjam, Odisha" }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user session is saved in localStorage
    const savedUser = localStorage.getItem('temple-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const dbUsers = JSON.parse(localStorage.getItem('temple-db-users')) || MOCK_USERS;
    const matchedUser = dbUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (matchedUser) {
      const sessionUser = { ...matchedUser };
      delete sessionUser.password; // Do not store password in state
      setUser(sessionUser);
      localStorage.setItem('temple-user', JSON.stringify(sessionUser));
      setLoading(false);
      return { success: true, user: sessionUser };
    } else {
      setLoading(false);
      return { success: false, message: "Invalid email or password." };
    }
  };

  const loginOTP = async (phone, otp) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (otp !== "123456") {
      setLoading(false);
      return { success: false, message: "Invalid OTP. Use '123456' for testing." };
    }
    
    const dbUsers = JSON.parse(localStorage.getItem('temple-db-users')) || MOCK_USERS;
    let matchedUser = dbUsers.find(u => u.phone === phone);
    
    if (!matchedUser) {
      // Auto-register as devotee if user doesn't exist yet
      matchedUser = {
        id: `usr_${Date.now()}`,
        name: `Devotee ${phone.slice(-4)}`,
        email: `user_${phone.slice(-4)}@temple.org`,
        phone: phone,
        role: "devotee"
      };
      const updatedDbUsers = [...dbUsers, matchedUser];
      localStorage.setItem('temple-db-users', JSON.stringify(updatedDbUsers));
    }

    const sessionUser = { ...matchedUser };
    delete sessionUser.password;
    setUser(sessionUser);
    localStorage.setItem('temple-user', JSON.stringify(sessionUser));
    setLoading(false);
    return { success: true, user: sessionUser };
  };

  const register = async (name, email, phone, password) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const dbUsers = JSON.parse(localStorage.getItem('temple-db-users')) || MOCK_USERS;
    const exists = dbUsers.find(u => u.email.toLowerCase() === email.toLowerCase() || u.phone === phone);
    
    if (exists) {
      setLoading(false);
      return { success: false, message: "Email or Mobile Number already registered." };
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      phone,
      password,
      role: "devotee"
    };

    const updatedDbUsers = [...dbUsers, newUser];
    localStorage.setItem('temple-db-users', JSON.stringify(updatedDbUsers));

    const sessionUser = { ...newUser };
    delete sessionUser.password;
    setUser(sessionUser);
    localStorage.setItem('temple-user', JSON.stringify(sessionUser));
    setLoading(false);
    return { success: true, user: sessionUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('temple-user');
  };

  const updateProfile = async (updatedData) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const dbUsers = JSON.parse(localStorage.getItem('temple-db-users')) || MOCK_USERS;
    const index = dbUsers.findIndex(u => u.id === user.id);
    
    if (index !== -1) {
      dbUsers[index] = { ...dbUsers[index], ...updatedData };
      localStorage.setItem('temple-db-users', JSON.stringify(dbUsers));
      
      const sessionUser = { ...user, ...updatedData };
      delete sessionUser.password;
      setUser(sessionUser);
      localStorage.setItem('temple-user', JSON.stringify(sessionUser));
      setLoading(false);
      return { success: true, user: sessionUser };
    }
    
    setLoading(false);
    return { success: false, message: "User not found." };
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, loginOTP, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
