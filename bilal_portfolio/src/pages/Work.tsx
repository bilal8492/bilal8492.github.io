import React from 'react';
import ProjectCard from '../components/ProjectCard';

const projects = [
    {
        id: 1,
        title: 'Project One',
        description: 'A brief description of Project One.',
        link: 'https://play.google.com/store/apps/details?id=com.example.projectone'
    },
    {
        id: 2,
        title: 'Project Two',
        description: 'A brief description of Project Two.',
        link: 'https://apps.apple.com/app/id1234567890'
    },
    {
        id: 3,
        title: 'WHATSEND',
        description: 'A web application that allows users to send messages easily.',
        link: 'https://whatsend.example.com'
    }
];

const Work: React.FC = () => {
    return (
        <div className="work-page">
            <h1>My Projects</h1>
            <div className="projects-container">
                {projects.map(project => (
                    <ProjectCard 
                        key={project.id} 
                        title={project.title} 
                        description={project.description} 
                        link={project.link} 
                    />
                ))}
            </div>
        </div>
    );
};

export default Work;