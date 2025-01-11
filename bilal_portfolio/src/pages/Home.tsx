import React from 'react';

const Home: React.FC = () => {
    return (
        <div className="home">
            <header>
                <h1>Bilal's Portfolio</h1>
                <h2>Software Developer</h2>
            </header>
            <section className="summary">
                <p>
                    Highly skilled and innovative Software Developer with 2+ years of experience in designing and building high-quality mobile and web applications. Proficient in React Native, React, and other modern web technologies, with a strong focus on hybrid mobile app development. Committed to delivering exceptional user experiences and staying up-to-date with industry trends.
                </p>
            </section>
            <section className="skills">
                <h3>Skills</h3>
                <ul>
                    <li>React</li>
                    <li>React Native</li>
                    <li>JavaScript</li>
                    <li>TypeScript</li>
                    <li>HTML/CSS</li>
                    <li>Node.js</li>
                </ul>
            </section>
        </div>
    );
};

export default Home;