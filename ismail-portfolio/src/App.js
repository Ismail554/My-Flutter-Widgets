// App.js
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        const top = section.getBoundingClientRect().top;
        const isVisible = top < window.innerHeight - 100;
        setIsVisible(prev => ({ ...prev, [section.id]: isVisible }));
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="App">
      <Navbar scrollToSection={scrollToSection} />
      <Hero />
      <Summary id="summary" isVisible={isVisible.summary} />
      <Skills id="skills" isVisible={isVisible.skills} />
      <Experience id="experience" isVisible={isVisible.experience} />
      <Projects id="projects" isVisible={isVisible.projects} />
      <Education id="education" isVisible={isVisible.education} />
      <Footer />
    </div>
  );
}

const Navbar = ({ scrollToSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo">MH</div>
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </button>
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li><button onClick={() => scrollToSection('summary')}>Summary</button></li>
          <li><button onClick={() => scrollToSection('skills')}>Skills</button></li>
          <li><button onClick={() => scrollToSection('experience')}>Experience</button></li>
          <li><button onClick={() => scrollToSection('projects')}>Projects</button></li>
          <li><button onClick={() => scrollToSection('education')}>Education</button></li>
          <li>
            <a
              href="/resume/ismail-resume.pdf"
              download="MD-Ismail-Hosen-Resume.pdf"
              className="resume-btn"
            >
              <i className="fas fa-download"></i> Resume PDF
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

// Hero Component
const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <h1>MD Ismail Hosen</h1>
          <h2>Flutter Developer | Junior Software Engineer</h2>
          <p>Building cross-platform mobile applications with Flutter</p>
          <div className="hero-contact">
            <a href="tel:+8801619524736" className="contact-link">
              <i className="fas fa-phone"></i> +880 1619-524736
            </a>
            <a href="mailto:ismailshuvo555@gmail.com" className="contact-link">
              <i className="fas fa-envelope"></i> ismailshuvo555@gmail.com
            </a>
            <a href="https://linkedin.com/in/ismail554" target="_blank" rel="noopener noreferrer" className="contact-link">
              <i className="fab fa-linkedin"></i> /ismail554
            </a>
            <a href="https://github.com/Ismail554" target="_blank" rel="noopener noreferrer" className="contact-link">
              <i className="fab fa-github"></i> /Ismail554
            </a>
          </div>
          <div className="hero-buttons">
            <button className="btn primary" onClick={() => document.getElementById('projects').scrollIntoView({ behavior: 'smooth' })}>
              View Projects
            </button>
            <button className="btn secondary" onClick={() => document.getElementById('experience').scrollIntoView({ behavior: 'smooth' })}>
              Experience
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="profile-placeholder">
            <span>👨‍💻</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// Summary Component
const Summary = ({ id, isVisible }) => {
  return (
    <section id={id} className={`section summary ${isVisible ? 'visible' : ''}`}>
      <div className="container">
        <h2 className="section-title">Professional Summary</h2>
        <div className="summary-content">
          <p>
            Mobile Application Developer with expertise in Flutter and a focus on building scalable,
            production-ready applications. Experienced in state management (Provider, GetX), Clean Architecture,
            and backend integration including RESTful APIs, WebSockets, and Firebase. Successfully integrated
            third-party services such as Agora for real-time communication, Stripe for payments, and Google Maps.
            Committed to writing clean, maintainable code and delivering optimized applications for both Android
            and iOS platforms.
          </p>
        </div>
      </div>
    </section>
  );
};

// Skills Component
const Skills = ({ id, isVisible }) => {
  const skills = {
    languages: ['Dart', 'Java', 'C/C++'],
    frameworks: ['Flutter', 'GetX', 'Provider', 'Firebase', 'Agora SDK', 'Stripe SDK', 'Google Maps SDK'],
    architecture: ['Clean Architecture', 'MVVM', 'REST API Integration', 'WebSocket', 'Real-time Communication'],
    tools: ['Git', 'GitHub', 'Android Studio', 'VS Code', 'Postman', 'Xcode'],
    platforms: ['Google Play Console', 'Apple App Store Connect'],
    soft: ['Team Leadership', 'Cross-functional Collaboration', 'Problem Solving', 'Agile Methodologies']
  };

  return (
    <section id={id} className={`section skills ${isVisible ? 'visible' : ''}`}>
      <div className="container">
        <h2 className="section-title">Technical Skills</h2>
        <div className="skills-grid">
          <div className="skill-category">
            <h3>Languages</h3>
            <div className="skill-tags">
              {skills.languages.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
            </div>
          </div>
          <div className="skill-category">
            <h3>Frameworks & Libraries</h3>
            <div className="skill-tags">
              {skills.frameworks.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
            </div>
          </div>
          <div className="skill-category">
            <h3>Architecture & Concepts</h3>
            <div className="skill-tags">
              {skills.architecture.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
            </div>
          </div>
          <div className="skill-category">
            <h3>Developer Tools</h3>
            <div className="skill-tags">
              {skills.tools.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
            </div>
          </div>
          <div className="skill-category">
            <h3>Platforms</h3>
            <div className="skill-tags">
              {skills.platforms.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
            </div>
          </div>
          <div className="skill-category">
            <h3>Soft Skills</h3>
            <div className="skill-tags">
              {skills.soft.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Experience Component
const Experience = ({ id, isVisible }) => {
  const experiences = [
    {
      title: 'Junior Flutter Developer | Assistant Team Leader',
      company: 'Join Venture AI',
      location: 'Dhaka, Bangladesh',
      period: 'Sep 2025 — Present',
      points: [
        'Developing scalable cross-platform mobile applications using Flutter, implementing Clean Architecture and MVVM patterns for maintainable code structure.',
        'Integrating real-time features using WebSockets and REST APIs, along with third-party services including Agora for live video calling and Stripe for payment processing.',
        'Conducting application profiling to identify and resolve performance issues, focusing on optimizing UI rendering for smooth user experiences.',
        'Mentoring junior developers and managing technical blockers in coordination with the Team Lead to ensure timely project delivery.'
      ]
    },
    {
      title: 'Mobile App Developer',
      company: 'Innovation IT',
      location: 'Dhaka, Bangladesh',
      period: 'Mar 2025 — Sep 2025',
      points: [
        'Developed native Android applications with responsive user interfaces tailored to client requirements.',
        'Implemented state management using Provider and integrated backend services including Firebase and REST APIs for data-driven functionality.',
        'Optimized application bundle sizes and resolved platform-specific issues to ensure app store compliance and operational stability.'
      ]
    }
  ];

  return (
    <section id={id} className={`section experience ${isVisible ? 'visible' : ''}`}>
      <div className="container">
        <h2 className="section-title">Professional Experience</h2>
        <div className="timeline">
          {experiences.map((exp, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-header">
                <h3>{exp.title}</h3>
                <span className="timeline-period">{exp.period}</span>
              </div>
              <div className="timeline-company">
                <i className="fas fa-building"></i> {exp.company} | {exp.location}
              </div>
              <ul className="timeline-points">
                {exp.points.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Projects Component
const Projects = ({ id, isVisible }) => {
  const projects = [
    {
      name: 'Geography Geyser',
      description: 'Educational quiz application focused on geography',
      tech: ['Flutter', 'Dart', 'Firebase', 'REST API'],
      points: [
        'Developed and published an educational quiz application focused on geography, featuring dynamic scoring and progression reward system.',
        'Implemented asynchronous data loading for smooth transitions between quiz sections and local caching for offline functionality.'
      ],
      link: 'https://play.google.com/store/apps/details?id=com.app.geography_geyser',
      linkText: 'Google Play'
    },
    {
      name: 'NetworkX Mobile App',
      description: 'Enterprise mobile application with API-driven content',
      tech: ['Flutter', 'Provider', 'REST API'],
      points: [
        'Built an enterprise mobile application with API-driven content delivery and interactive dashboards.',
        'Implemented network layer with interceptors for seamless authentication flows and token refresh handling.'
      ],
      link: 'https://play.google.com/store/apps/details?id=com.app.neworkx',
      linkText: 'Google Play'
    },
    {
      name: 'ScoreLivePro',
      description: 'Sports application with live score updates',
      tech: ['Flutter', 'WebSockets', 'State Management'],
      points: [
        'Developed a sports application providing live score updates and commentary via WebSocket connections.',
        'Utilized state management to handle real-time data streams while maintaining UI performance.'
      ],
      link: 'https://github.com/Ismail554/scorelivepro',
      linkText: 'GitHub'
    },
    {
      name: 'AnchorUP App',
      description: 'Modular application with reusable components',
      tech: ['Flutter', 'Modular Architecture'],
      points: [
        'Created a modular application with reusable UI widgets to streamline future feature development.'
      ],
      link: 'https://github.com/Ismail554/AnchorApp',
      linkText: 'GitHub'
    }
  ];

  return (
    <section id={id} className={`section projects ${isVisible ? 'visible' : ''}`}>
      <div className="container">
        <h2 className="section-title">Projects</h2>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={index} className="project-card">
              <div className="project-header">
                <h3>{project.name}</h3>
                <span className="project-badge">{project.tech.join(' • ')}</span>
              </div>
              <p className="project-description">{project.description}</p>
              <ul className="project-points">
                {project.points.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
              <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
                View on {project.linkText} →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Education Component
const Education = ({ id, isVisible }) => {
  const education = [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'Canadian University of Bangladesh',
      location: 'Dhaka, Bangladesh',
      period: '2025 — Present',
      note: 'Current'
    },
    {
      degree: 'Diploma in Computer Science and Technology',
      institution: 'Feni Computer Institute',
      location: 'Feni, Bangladesh',
      period: '2020 — 2024',
      note: 'CGPA: 3.56'
    },
    {
      degree: 'Computer Technology',
      institution: 'Dhakil Vocational',
      location: 'Feni, Bangladesh',
      period: '2018 — 2020',
      note: 'GPA: 5.00'
    }
  ];

  return (
    <section id={id} className={`section education ${isVisible ? 'visible' : ''}`}>
      <div className="container">
        <h2 className="section-title">Education</h2>
        <div className="education-list">
          {education.map((edu, index) => (
            <div key={index} className="education-item">
              <div className="education-header">
                <h3>{edu.degree}</h3>
                <span className="education-period">{edu.period}</span>
              </div>
              <div className="education-institution">
                <i className="fas fa-university"></i> {edu.institution} | {edu.location}
              </div>
              {edu.note && <span className="education-note">{edu.note}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <p>© 2025 MD Ismail Hosen. All rights reserved.</p>
          <div className="footer-links">
            <a href="https://linkedin.com/in/ismail554" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="https://github.com/Ismail554" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i>
            </a>
            <a href="mailto:ismailshuvo555@gmail.com">
              <i className="fas fa-envelope"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default App;