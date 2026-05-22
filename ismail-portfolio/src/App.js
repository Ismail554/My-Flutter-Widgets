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
          <h2>Flutter Developer | Mobile Software Engineer</h2>
          <p>Architecting and shipping cross-platform applications to App Store & Google Play</p>
          <div className="hero-contact">
            <a href="tel:+8801619524736" className="contact-link">
              <i className="fas fa-phone"></i> +880 1619-524736
            </a>
            <a href="mailto:mdismail.cse59@gmail.com" className="contact-link">
              <i className="fas fa-envelope"></i> mdismail.cse59@gmail.com
            </a>
            <a href="https://linkedin.com/in/ismail554" target="_blank" rel="noopener noreferrer" className="contact-link">
              <i className="fab fa-linkedin"></i> /ismail554
            </a>
            <a href="https://github.com/Ismail554" target="_blank" rel="noopener noreferrer" className="contact-link">
              <i className="fab fa-github"></i> /Ismail554
            </a>
            <a href="https://my-portfolio-lake-three-88.vercel.app/" target="_blank" rel="noopener noreferrer" className="contact-link">
              <i className="fas fa-globe"></i> Portfolio
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
            Results-driven Flutter Developer and Technical Lead with a proven track record of architecting
            and shipping cross-platform applications to the App Store and Google Play. Expertise in delivering
            pixel-perfect, 90fps user experiences utilizing Clean Architecture, MVVM, and robust state management
            (Provider, GetX). Adept at driving end-to-end development—from QA execution to production—while
            seamlessly integrating real-time capabilities (WebSockets, Agora), AI features, and secure payment
            gateways (Stripe).
          </p>
        </div>
      </div>
    </section>
  );
};

// Skills Component
const Skills = ({ id, isVisible }) => {
  const skills = {
    languages: ['Dart', 'Java', 'C / C++', 'Python'],
    frameworks: ['Flutter', 'Android SDK', 'Provider', 'GetX', 'GoRouter'],
    architecture: ['Clean Architecture', 'MVVM', 'REST API Integration', 'WebSockets'],
    backendServices: ['Firebase (Auth, Firestore, Storage)', 'Agora SDK', 'Stripe SDK', 'Google Maps SDK'],
    tools: ['Git', 'GitHub', 'VS Code', 'Android Studio', 'Xcode', 'Postman', 'Google Play Console', 'App Store Connect'],
    languagesSpoken: ['Bengali (Native)', 'English (Professional Working)']
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
            <h3>Mobile Frameworks</h3>
            <div className="skill-tags">
              {skills.frameworks.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
            </div>
          </div>
          <div className="skill-category">
            <h3>Architecture</h3>
            <div className="skill-tags">
              {skills.architecture.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
            </div>
          </div>
          <div className="skill-category">
            <h3>Backend & Services</h3>
            <div className="skill-tags">
              {skills.backendServices.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
            </div>
          </div>
          <div className="skill-category">
            <h3>Tools & Platforms</h3>
            <div className="skill-tags">
              {skills.tools.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
            </div>
          </div>
          <div className="skill-category">
            <h3>Languages</h3>
            <div className="skill-tags">
              {skills.languagesSpoken.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
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
      title: 'Junior Flutter Developer · Assistant Team Leader',
      company: 'Join Venture AI',
      location: 'Dhaka, Bangladesh',
      period: 'Sep 2025 — Present',
      points: [
        'Engineered cross-platform Flutter applications following Clean Architecture, reducing feature delivery time by ~25% through modular design.',
        'Optimized UI rendering pipelines, resolving jank on low-end devices and targeting 90fps to improve frame rate consistency by 20%.',
        'Integrated REST APIs, WebSockets, and third-party SDKs including Agora (video/audio) and Stripe (payments).',
        'Led a team of 3 junior developers; conducted code reviews, technical mentorship, and reduced production hotfixes by 30%.'
      ]
    },
    {
      title: 'Lead Flutter Developer',
      company: 'Freelance Mobile Developer / App_Oreo Team Lead',
      location: 'Dhaka, Bangladesh',
      period: 'Jan 2025 — Present',
      points: [
        'Spearheaded end-to-end app development and acted as the primary technical point of contact for international clients via freelance platforms.',
        'Engineered the LIVU App for the Apple ecosystem, featuring a complex predictive dashboard that calculates performance scores and fatigue risk.',
        'Implemented a subscription-based monetization model using Stripe for a Flutter-based job-searching application, managing deployment and platform fee considerations.'
      ]
    },
    {
      title: 'Mobile App Developer',
      company: 'Innovation IT',
      location: 'Dhaka, Bangladesh',
      period: 'Mar 2025 — Sep 2025',
      points: [
        'Built native Android applications in Java with responsive Material Design UIs aligned to platform lifecycle best practices.',
        'Integrated REST APIs and Firebase backend services (Auth, Firestore, Storage) for dynamic content delivery.',
        'Reduced APK size by 15% and resolved platform-specific crashes to maintain 99.5% crash-free sessions.'
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
      name: 'ScoreLivePro',
      description: 'Real-time sports companion app with live scoring',
      tech: ['Flutter', 'WebSockets', 'Localization', 'QA'],
      points: [
        'Managed quality assurance (QA) and development tracking for a real-time sports companion app.',
        'Implemented 6-language localization and handled 100+ concurrent data updates per second via WebSocket streams without UI lag.',
        'Published cross-platform to both stores, achieving 4.8 average rating.'
      ],
      link: 'https://play.google.com/store/apps/details?id=com.scorelivepro.app',
      linkText: 'Google Play'
    },
    {
      name: 'Geography Geyser',
      description: 'Educational quiz app published to 2,000+ users',
      tech: ['Flutter', 'Dart', 'Firebase', 'REST API'],
      points: [
        'Transitioned the application from closed testing to production, shipping to 2,000+ users across Google Play and the App Store.',
        'Engineered offline-first caching, which reduced bounce rates by 15%, and managed the end-to-end release pipeline.'
      ],
      link: 'https://play.google.com/store/apps/details?id=com.geographygeyser.simon',
      linkText: 'Google Play'
    },
    {
      name: 'NetworkX Mobile App',
      description: 'Enterprise mobile application with API-driven dashboards',
      tech: ['Flutter', 'Provider', 'REST API'],
      points: [
        'Built an enterprise mobile app with API-driven dashboards; engineered the network layer with automatic token refresh for seamless authentication.'
      ],
      link: 'https://play.google.com/store/apps/details?id=com.app.neworkx',
      linkText: 'Google Play'
    },
    {
      name: 'AnchorUP',
      description: 'Social networking app with real-time video & AI bot',
      tech: ['Flutter', 'Agora SDK', 'AI', 'Social Media'],
      points: [
        'Architected a scalable Flutter social networking application with a reusable modular widget library, accelerating feature development by 30%.',
        'Integrated the Agora SDK for seamless real-time video calling and embedded an interactive AI bot to drive user engagement and communication.'
      ],
      link: 'https://github.com/Ismail554/AnchorApp',
      linkText: 'GitHub'
    },
    {
      name: 'Reflections (My Notes App)',
      description: 'Note-taking app with Clean Architecture & Firebase',
      tech: ['Flutter', 'GetX', 'GoRouter', 'Firebase'],
      points: [
        'Built a note-taking app using Clean Architecture with GetX and GoRouter; integrated Firebase persistence using the repository pattern.'
      ],
      link: 'https://github.com/Ismail554/my_note_app_reflections',
      linkText: 'GitHub'
    },
    {
      name: 'SwissCarExchange',
      description: 'B2B car marketplace with listing & buyer-seller flows',
      tech: ['Flutter', 'MVVM', 'Provider', 'GoRouter', 'REST API'],
      points: [
        'Built a B2B car marketplace with listing, browsing, and buyer-seller connection flows using MVVM architecture.',
        'Implemented Provider for state management, GoRouter for declarative navigation, and REST API integration throughout.',
        'Delivered cross-platform for both iOS and Android with Clean Architecture from data layer to presentation.'
      ],
      link: 'https://github.com/Ismail554/SwissCarExchange',
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
            <a href="mailto:mdismail.cse59@gmail.com">
              <i className="fas fa-envelope"></i>
            </a>
            <a href="https://my-portfolio-lake-three-88.vercel.app/" target="_blank" rel="noopener noreferrer">
              <i className="fas fa-globe"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default App;