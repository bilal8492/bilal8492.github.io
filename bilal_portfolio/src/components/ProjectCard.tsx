import React from 'react';

interface ProjectCardProps {
    title: string;
    description: string;
    link: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description, link }) => {
    return (
        <div className="project-card">
            <h3>{title}</h3>
            <p>{description}</p>
            <a href={link} target="_blank" rel="noopener noreferrer" className="project-link">
                View Project
            </a>
        </div>
    );
};

export default ProjectCard;