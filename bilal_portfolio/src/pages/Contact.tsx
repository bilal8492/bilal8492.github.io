import React from 'react';
import ContactForm from '../components/ContactForm';

const Contact: React.FC = () => {
    return (
        <div className="contact-page">
            <h1>Contact Me</h1>
            <p>If you have any questions or inquiries, feel free to reach out using the form below.</p>
            <ContactForm />
        </div>
    );
};

export default Contact;