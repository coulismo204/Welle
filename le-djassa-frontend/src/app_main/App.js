import React, { useState } from 'react';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from '../core/common/Navbar';
import Slide from '../core/common/slide';
import Navbar2 from '../core/common/Navbar2';
import Footer from '../core/common/Footer';
import Homepage from '../views/customer/Homepage';
import Login from '../core/component/authenticate/Login';
import Signup from '../core/component/authenticate/Signup';
import ForgotPassword from '../core/component/authenticate/ForgotPassword';
import ResetPassword from '../core/component/authenticate/ResetPassword';
import Vendeur from '../views/seller/home';
import Commandes from '../core/component/seller/Commandes';
import CommandeDetails from '../core/component/seller/CommandeDetails';
import { UserProvider } from '../core/common/UserContext';  
import { OrdersProvider } from '../core/common/OrdersContext';
import ProductDetail from '../core/component/customer/ProductDetail';
import CartPage from '../core/component/customer/CartPage';
import CustomerMyAccount from '../core/component/customer/compte/MyAccount';
import DetailCommandeHistorique from '../core/component/customer/compte/DetailCommandeHistorique';
import { CartProvider } from '../core/common/CartContext';
import Confirmation from '../core/component/customer/Confirmation';
import EtatCommandes from '../core/component/customer/EtatCommandes';
import RoleProtectedRoute from '../core/store/RoleProtectedRoute';
import PrivacyPolicy from '../views/legal/PrivacyPolicy';
import TermsAndConditions from '../views/legal/TermsAndConditions';

function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({ query: '', categorie: [] });

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    return (
        <Router>
            <UserProvider>
                <OrdersProvider>
                    <CartProvider>
                        <NavbarWithCondition handleSearch={handleSearch} formData={formData} setFormData={setFormData} />
                        <Routes>
                            {/* Routes publiques */}
                            <Route path="/" element={
                                <Homepage searchQuery={searchQuery} formData={formData} setFormData={setFormData}/>}
                            />
                            <Route path="/product/:productId" element={<ProductDetail />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />



                            {/* Routes protégées pour les acheteurs */}
                            <Route path="/cart" element={
                                <RoleProtectedRoute requiredRole="acheteur">
                                    <CartPage />
                                </RoleProtectedRoute>
                            } />
                            <Route path="/confirmation" element={
                                <RoleProtectedRoute requiredRole="acheteur">
                                    <Confirmation />
                                </RoleProtectedRoute>
                            } />
                            <Route path="/EtatCommandes" element={
                                <RoleProtectedRoute requiredRole="acheteur">
                                    <EtatCommandes />
                                </RoleProtectedRoute>
                            } />
                            <Route path="/Customer/MyAcount" element={
                                <RoleProtectedRoute requiredRole="acheteur">
                                    <CustomerMyAccount />
                                </RoleProtectedRoute>
                            } />

                            <Route path="/Customer/MyAcount/commandes/:id" element={
                                <RoleProtectedRoute requiredRole="acheteur">
                                    <DetailCommandeHistorique />
                                </RoleProtectedRoute>
                            } />

                            {/* Routes protégées pour les vendeurs */}
                            <Route path="/uservendeur-interface" element={
                                <RoleProtectedRoute requiredRole="vendeur">
                                    <Vendeur />
                                </RoleProtectedRoute>
                            } />
                            <Route path="/commandes" element={
                                <RoleProtectedRoute requiredRole="vendeur">
                                    <Commandes />
                                </RoleProtectedRoute>
                            } />
                        </Routes>
                        <Footer />
                    </CartProvider>
                </OrdersProvider>
            </UserProvider>
        </Router>
    );
}

const ShowNavbar2 = () => {
    const location = useLocation();
    return location.pathname === '/' ? <Navbar2 /> : null;
};

function NavbarWithCondition({ handleSearch, formData, setFormData }) {
    const location = useLocation();
    const isSellerRoute = location.pathname.startsWith('/uservendeur-interface') || 
                          location.pathname.startsWith('/commandes');

    return (
        <div>
            { !isSellerRoute && <Navbar onSearch={handleSearch} formData={formData} setFormData={setFormData} /> }
            { !isSellerRoute && <Slide /> } {/* Place Slide between Navbar and Navbar2 */}
            <ShowNavbar2 />
        </div>
    );
}

export default App;