// components/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacter } from '../contexts/CharacterContext';
import { motion } from 'framer-motion';
import { 
  FaGraduationCap, 
  FaStar, 
  FaRocket, 
  FaBrain, 
  FaInfinity, 
  FaCalculator,
  FaRobot,
  FaGlobe,
  FaLock,
  FaCheck,
  FaPlay,
  FaEye,
  FaArrowRight,
  FaLightbulb,
  FaBolt,
  FaUsers,
  FaGamepad,
  FaMagic,
  FaTrophy,
  FaHeart,
  FaSmile
} from 'react-icons/fa';
import {
  HiAcademicCap, 
  HiLightningBolt, 
  HiCheckCircle,
  HiSparkles
} from 'react-icons/hi';
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import './LandingPage.css';

// UnDraw-style local illustrations (kept in src/assets)
import HeroMath from "../assets/mathematics_p600.svg";
import FeatureMath from "../assets/mathematics-4otb.svg";
import FeatureAI from "../assets/artificial-intelligence-ay46.svg";
import FeatureLearning from "../assets/online-learning-ao11.svg";
import GameLoops from "../assets/loops-5qzx.svg";
import GameProgramming from "../assets/programming-2svr.svg";
import GameAdventure from "../assets/adventure-map-hnin.svg";


const LandingPage = () => {
  const navigate = useNavigate();
  const { selectedCharacter, setSelectedCharacter, characters } = useCharacter();
  const [selectedCharacterLocal, setSelectedCharacterLocal] = useState(selectedCharacter);

  useEffect(() => {
               document.title = 'BrainQuest - AI Mathematics Learning Platform';
    document.body.className = 'landing-page-body';
    
    return () => {
      document.body.className = '';
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="landing-page-main">
      {/* Animated Background */}
      <div className="floating-elements">
        <motion.div 
          className="floating-icon floating-icon-1"
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <FaStar className="text-yellow-400" />
        </motion.div>
        <motion.div 
          className="floating-icon floating-icon-2"
          animate={{ 
            y: [0, -40, 0],
            rotate: [0, -360]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: -2
          }}
        >
          <FaRocket className="text-blue-500" />
        </motion.div>
        <motion.div 
          className="floating-icon floating-icon-3"
          animate={{ 
            y: [0, -25, 0],
            rotate: [0, 180]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: -4
          }}
        >
          <FaLightbulb className="text-yellow-500" />
        </motion.div>
        <motion.div 
          className="floating-icon floating-icon-4"
          animate={{ 
            y: [0, -35, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: -1
          }}
        >
          <FaHeart className="text-pink-500" />
        </motion.div>
        <motion.div 
          className="floating-icon floating-icon-5"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 270]
          }}
          transition={{ 
            duration: 9, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: -3
          }}
        >
          <FaTrophy className="text-orange-500" />
        </motion.div>
        <motion.div 
          className="floating-icon floating-icon-6"
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, -180]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: -5
          }}
        >
          <FaSmile className="text-green-500" />
        </motion.div>
        
        {/* Math symbols floating in background */}
        <motion.div 
          className="floating-math floating-math-1"
          animate={{ 
            y: [0, -50, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          +
        </motion.div>
        <motion.div 
          className="floating-math floating-math-2"
          animate={{ 
            y: [0, -45, 0],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{ 
            duration: 14, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: -3
          }}
        >
          ×
        </motion.div>
        <motion.div 
          className="floating-math floating-math-3"
          animate={{ 
            y: [0, -40, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: -6
          }}
        >
          =
        </motion.div>
        <motion.div 
          className="floating-math floating-math-4"
          animate={{ 
            y: [0, -55, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            duration: 13, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: -2
          }}
        >
          √
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Badge variant="secondary" className="hero-badge">
                <HiSparkles className="inline-block w-4 h-4 mr-2" />
                Petualangan Matematika dengan AI
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Selamat datang di
              <span className="gradient-text"> BrainQuest!</span>
              <br />
              <span className="subtitle">Di Mana Matematika Jadi Ajaib</span>
            </motion.h1>
            
            <motion.p 
              className="hero-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Join millions of kids on an incredible journey through the world of mathematics! 
              Our AI companions make learning fun, interactive, and absolutely magical. ✨
            </motion.p>
            
            <motion.div 
              className="hero-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Button
                size="lg"
                onClick={() => scrollToSection('character-selection')}
                className="primary-button"
              >
                <FaPlay className="mr-2 h-5 w-5" />
                Start Your Adventure
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('features-section')}
                className="secondary-button"
              >
                <FaEye className="mr-2 h-5 w-5" />
                See The Magic
              </Button>
            </motion.div>
            
            {/* Fun Stats */}
            <motion.div 
              className="hero-stats"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.8 }}
            >
              <motion.div 
                className="stat-card"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="stat-icon-wrapper">
                  <FaUsers className="text-blue-600" />
                </div>
                <div className="stat-content">
                  <div className="stat-number">3M+</div>
                  <div className="stat-label">Happy Kids</div>
                </div>
              </motion.div>
              <motion.div 
                className="stat-card"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="stat-icon-wrapper">
                  <FaStar className="text-yellow-500" />
                </div>
                <div className="stat-content">
                  <div className="stat-number">98%</div>
                  <div className="stat-label">Love Math Now!</div>
                </div>
              </motion.div>
              <motion.div 
                className="stat-card"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="stat-icon-wrapper">
                  <FaGamepad className="text-purple-600" />
                </div>
                <div className="stat-content">
                  <div className="stat-number">15+</div>
                  <div className="stat-label">Fun Games</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="hero-illustration"
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="illustration-wrapper">
              <motion.img
                src={HeroMath}
                alt="AI Mathematics Learning Illustration"
                className="hero-image"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
              {/* Animated Math Elements */}
              <div className="math-elements">
                <motion.div 
                  className="math-element math-element-1"
                  animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0
                  }}
                >
                  2 + 2 = 4
                </motion.div>
                <motion.div 
                  className="math-element math-element-2"
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, -3, 0]
                  }}
                  transition={{ 
                    duration: 3.5, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  5 × 3 = 15
                </motion.div>
                <motion.div 
                  className="math-element math-element-3"
                  animate={{ 
                    y: [0, -12, 0],
                    rotate: [0, 4, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  π ≈ 3.14
                </motion.div>
                <motion.div 
                  className="math-element math-element-4"
                  animate={{ 
                    y: [0, -18, 0],
                    rotate: [0, -2, 0]
                  }}
                  transition={{ 
                    duration: 3.2, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1.5
                  }}
                >
                  √16 = 4
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features-section">
        <div className="section-container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">
              Kenapa Anak-anak <span className="gradient-text">Suka</span> BrainQuest
            </h2>
            <p className="section-description">
              Temukan fitur ajaib yang bikin belajar matematika jadi petualangan seru!
            </p>
          </motion.div>
          
          <div className="features-grid">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="feature-card highlight-card">
                <motion.div 
                  className="feature-icon-wrapper primary"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <FaMagic className="text-white" />
                </motion.div>
                <div className="feature-image">
                  <img src={FeatureAI} alt="AI Magic" className="feature-img" />
                </div>
                <h3 className="feature-title">Tutor AI Ajaib</h3>
                <p className="feature-description">
                  Kenalan sama teman AI pribadi yang ngerti banget cara kamu belajar! Selalu sabar, selalu dukung, dan penuh kejutan! 🤖✨
                </p>
                <Button className="feature-button primary">
                  Kenalan Sama Tutor <FaArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            </motion.div>
           
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="feature-card">
                <motion.div 
                  className="feature-icon-wrapper secondary"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <FaGamepad className="text-white" />
                </motion.div>
                <div className="feature-image">
                  <img src={FeatureMath} alt="Interactive Games" className="feature-img" />
                </div>
                <h3 className="feature-title">Petualangan Matematika Seru</h3>
                <p className="feature-description">
                  Selesaikan puzzle, jalani misi, dan temukan harta karun sambil jago matematika! Setiap soal adalah petualangan baru yang seru! 🏰⚔️
                </p>
                <Button className="feature-button">
                  Mulai Main <FaArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            </motion.div>
           
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="feature-card">
                <motion.div 
                  className="feature-icon-wrapper tertiary"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <FaTrophy className="text-white" />
                </motion.div>
                <div className="feature-image">
                  <img src={FeatureLearning} alt="Personalized Learning" className="feature-img" />
                </div>
                <h3 className="feature-title">Perjalanan Belajar Pribadi</h3>
                <p className="feature-description">
                  Setiap anak punya cara belajar sendiri, dan itu keren! AI kami bikin jalur unik buat kamu, rayakan setiap kemenangan bareng! 🌟📚
                </p>
                <Button className="feature-button">
                  Mulai Perjalanan <FaArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Character Selection Section */}
      <section className="character-section" id="character-selection">
        <div className="section-container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">
              Pilih <span className="gradient-text">Teman Belajar</span> Kamu
            </h2>
            <p className="section-description">
              Setiap petualangan seru pasti butuh teman! Pilih AI favoritmu buat nemenin belajar matematika.
            </p>
          </motion.div>

          <div className="characters-grid">
            {characters.map((character, index) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card
                  className={`character-card ${selectedCharacterLocal?.id === character.id ? 'selected' : ''} ${character.locked ? 'locked' : ''}`}
                  onClick={() => !character.locked && setSelectedCharacterLocal(character)}
                >
                  <div className="character-avatar-wrapper">
                    <Avatar className="character-avatar">
                      <AvatarImage src={character.image} alt={character.name} />
                      <AvatarFallback>{character.name?.slice(0,2) ?? 'AI'}</AvatarFallback>
                    </Avatar>
                    {selectedCharacterLocal?.id === character.id && (
                      <motion.div 
                        className="selected-indicator"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <FaCheck className="text-white" />
                      </motion.div>
                    )}
                    {character.locked && (
                      <div className="locked-overlay">
                        <FaLock className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="character-name">{character.name}</h3>
                  <p className="character-description">{character.description}</p>
                  
                  <div className="character-abilities">
                    {character.abilities.map((ability, abilityIndex) => (
                      <motion.span 
                        key={abilityIndex} 
                        className="ability-tag"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (index * 0.1) + (abilityIndex * 0.05) }}
                        viewport={{ once: true }}
                      >
                        {ability}
                      </motion.span>
                    ))}
                  </div>
                  
                  {character.locked && (
                    <div className="unlock-info">
                      <FaLock className="h-4 w-4" />
                      Unlock at Level {character.unlockLevel}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="character-cta"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                onClick={() => {
                  if (selectedCharacterLocal && !selectedCharacterLocal.locked) {
                    setSelectedCharacter(selectedCharacterLocal);
                    navigate('/game-start');
                  } else if (selectedCharacterLocal && selectedCharacterLocal.locked) {
                    alert('Karakter ini masih terkunci! Selesaikan level dulu biar bisa dibuka! 🔓');
                  } else {
                    alert('Pilih teman belajarmu dulu ya! 😊');
                  }
                }}
                disabled={!selectedCharacterLocal || selectedCharacterLocal.locked}
                className="adventure-button"
              >
                <FaRocket className="mr-2 h-5 w-5" />
                Mulai Petualangan!
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Games Section */}
      <section className="games-section" id="games-section">
        <div className="section-container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">
              Dunia Matematika <span className="gradient-text">Keren</span> Menunggu!
            </h2>
            <p className="section-description">
              Jelajahi berbagai dunia matematika, masing-masing punya tantangan dan hadiah unik!
            </p>
          </motion.div>
          
          <div className="games-grid">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -8 }}
            >
              <Card className="game-card learning-buddy-card" onClick={() => navigate('/iteration')}>
                <div className="learning-buddy-layout">
                  <div className="game-logo-circle loops">
                    <FaInfinity className="text-white" />
                  </div>
                  <h3 className="game-title">Negeri Pola</h3>
                  <p className="game-description">
                    Kuasai pola ajaib dan bikin loop keren! Temukan rahasia pengulangan dan logika! 🔄✨
                  </p>
                  <div className="game-features">
                    <span className="feature-tag">🔄 Jago Pola</span>
                    <span className="feature-tag">✨ Latihan Logika</span>
                    <span className="feature-tag">🎮 Seru & Interaktif</span>
                  </div>
                  <Button className="game-button loops-theme">
                    Masuk Negeri Pola
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -8 }}
            >
              <Card className="game-card learning-buddy-card" onClick={() => navigate('/numeration')}>
                <div className="learning-buddy-layout">
                  <div className="game-logo-circle numbers">
                    <FaCalculator className="text-white" />
                  </div>
                  <h3 className="game-title">Kerajaan Angka</h3>
                  <p className="game-description">
                    Jadi penguasa angka! Selesaikan soal kerajaan dan jadi Juara Angka! 👑🔢
                  </p>
                  <div className="game-features">
                    <span className="feature-tag">👑 Tantangan Kerajaan</span>
                    <span className="feature-tag">🔢 Jago Angka</span>
                    <span className="feature-tag">🏆 Status Juara</span>
                  </div>
                  <Button className="game-button numbers-theme">
                    Kuasai Kerajaan
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -8 }}
            >
              <Card className="game-card learning-buddy-card" onClick={() => navigate('/kubo')}>
                <div className="learning-buddy-layout">
                  <div className="game-logo-circle robot">
                    <FaRobot className="text-white" />
                  </div>
                  <h3 className="game-title">Pabrik Robot</h3>
                  <p className="game-description">
                    Program robot lucu pakai blok visual! Ajari mereka matematika dan lihat mereka beraksi! 🤖⚡
                  </p>
                  <div className="game-features">
                    <span className="feature-tag">🤖 Program Robot</span>
                    <span className="feature-tag">🧩 Blok Visual</span>
                    <span className="feature-tag">⚡ Belajar STEM</span>
                  </div>
                  <Button className="game-button robot-theme">
                    Bangun Robot
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -8 }}
            >
              <Card className="game-card learning-buddy-card" onClick={() => navigate('/open-world-game')}>
                <div className="learning-buddy-layout">
                  <div className="game-logo-circle adventure">
                    <FaGlobe className="text-white" />
                  </div>
                  <h3 className="game-title">Galaksi Petualangan</h3>
                  <p className="game-description">
                    Jelajahi dunia tak terbatas penuh misteri matematika dan harta tersembunyi! 🌌🗺️
                  </p>
                  <div className="game-features">
                    <span className="feature-tag">🌌 Dunia Tak Terbatas</span>
                    <span className="feature-tag">🗺️ Misteri Matematika</span>
                    <span className="feature-tag">💎 Harta Tersembunyi</span>
                  </div>
                  <Button className="game-button adventure-theme">
                    Jelajahi Galaksi
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-container">
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="cta-title">
              Siap Bikin Matematika <span className="gradient-text">Ajaib</span>?
            </h2>
            <p className="cta-description">
              Gabung jutaan anak yang udah buktiin kalau matematika bisa jadi bagian paling seru dari hari mereka!
            </p>
            
            {/* Quick testimonials */}
            <motion.div 
              className="testimonials-mini"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="testimonial-item">
                <div className="stars">⭐⭐⭐⭐⭐</div>
                <p>"Anakku sekarang malah minta belajar matematika!"</p>
                <span>- Ibu Sarah, Orang Tua</span>
              </div>
              <div className="testimonial-item">
                <div className="stars">⭐⭐⭐⭐⭐</div>
                <p>"Aplikasi matematika paling seru! Suka banget!"</p>
                <span>- Alex, 9 tahun</span>
              </div>
              <div className="testimonial-item">
                <div className="stars">⭐⭐⭐⭐⭐</div>
                <p>"Nilai murid-muridku naik 40%!"</p>
                <span>- Bu Johnson, Guru</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                onClick={() => scrollToSection('character-selection')}
                className="cta-button"
              >
                <FaMagic className="mr-3 h-6 w-6" />
                Mulai Keajaiban Sekarang!
              </Button>
            </motion.div>
          </motion.div>
          <div className="cta-decoration">
            <div className="magic-sparkles">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <HiSparkles className="sparkle sparkle-1" />
              </motion.div>
              <motion.div
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: -1
                }}
              >
                <HiSparkles className="sparkle sparkle-2" />
              </motion.div>
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 90, 180]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: -2
                }}
              >
                <HiSparkles className="sparkle sparkle-3" />
              </motion.div>
              <motion.div
                animate={{ 
                  scale: [1.1, 1, 1.1],
                  rotate: [180, 270, 360]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: -1.5
                }}
              >
                <HiSparkles className="sparkle sparkle-4" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
