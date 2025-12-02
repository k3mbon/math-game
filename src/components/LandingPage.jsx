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
  FaSmile,
  FaChartLine,
  FaShieldAlt,
  FaAward,
  FaClock,
  FaMobile,
  FaBell
} from 'react-icons/fa';
import {
  HiAcademicCap, 
  HiLightningBolt, 
  HiCheckCircle,
  HiSparkles,
  HiTrendingUp,
  HiUserGroup,
  HiClock
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
    document.title = 'Rekurno - Belajar Matematika Seru dengan AI';
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
  const handleGameClick = (id) => {
    navigate(`/game/${id}`);
  };

  return (
    <main className="landing-page-main">
      {/* Hero Section */}
      <section className="hero-container">
        <div className="hero-content">
          <Badge variant="secondary" className="hero-badge">
            <HiSparkles className="inline-block w-4 h-4 mr-2" />
            Platform Belajar Matematika AI #1
          </Badge>
          
          <h1 className="hero-title">
            Belajar Matematika Jadi Seru dengan AI
          </h1>
          
          <p className="hero-description">
            Gabung sama 3 juta siswa di seluruh dunia yang udah ngerasain serunya belajar matematika lewat platform pintar yang bisa nyesuain sama gaya belajar kamu. Rasain pengalaman belajar yang personal dan berkembang bareng kamu.
          </p>
          
          <div className="hero-buttons">
            <Button
              size="lg"
              onClick={() => scrollToSection('character-selection')}
              className="primary-button"
            >
              <FaPlay className="mr-2 h-5 w-5" />
              Coba Gratis Sekarang
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection('features-section')}
              className="secondary-button"
            >
              <FaEye className="mr-2 h-5 w-5" />
              Lihat Demo
            </Button>
          </div>
          
          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-number">3M+</div>
              <div className="stat-label">Siswa Aktif</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">89%</div>
              <div className="stat-label">Peningkatan Nilai</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Penghargaan</div>
            </div>
          </div>
        </div>
        
        <div className="hero-illustration">
          <img
            src="/undraw_math_ldpv.svg"
            alt="Ilustrasi Belajar Matematika"
            className="hero-image"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="section-container" id="features-section">
        <div className="section-header">
          <h2 className="section-title">
            Kenapa Guru-Guru Pilih Rekurno
          </h2>
          <p className="section-description">
            Temuin fitur-fitur keren yang bikin belajar matematika jadi efektif, seru, dan bisa diukur hasilnya.
          </p>
        </div>
        
        <div className="features-grid">
          <Card className="feature-card">
            <div className="feature-icon-wrapper">
              <FaBrain />
            </div>
            <h3 className="feature-title">Personalisasi dengan AI</h3>
            <p className="feature-description">
              Algoritma machine learning canggih yang bisa nyesuain sama gaya belajar, kecepatan, dan preferensi setiap siswa, bikin pengalaman belajar yang beneran personal.
            </p>
            <div className="feature-benefits">
              <div className="benefit-item">
                <FaCheck className="benefit-icon" />
                <span>Penyesuaian tingkat kesulitan otomatis</span>
              </div>
              <div className="benefit-item">
                <FaCheck className="benefit-icon" />
                <span>Pengenalan gaya belajar</span>
              </div>
              <div className="benefit-item">
                <FaCheck className="benefit-icon" />
                <span>Tracking progress & analitik</span>
              </div>
            </div>
            <Button className="feature-button">
              Jelajahi Fitur AI <FaArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
         
          <Card className="feature-card">
            <div className="feature-icon-wrapper">
              <FaGamepad />
            </div>
            <h3 className="feature-title">Game Belajar Interaktif</h3>
            <p className="feature-description">
              Ajak siswa berpetualang seru dalam dunia matematika yang mengubah konsep abstrak jadi pengalaman nyata dan interaktif.
            </p>
            <div className="feature-benefits">
              <div className="benefit-item">
                <FaCheck className="benefit-icon" />
                <span>Konten sesuai kurikulum</span>
              </div>
              <div className="benefit-item">
                <FaCheck className="benefit-icon" />
                <span>Pembelajaran multi-sensori</span>
              </div>
              <div className="benefit-item">
                <FaCheck className="benefit-icon" />
                <span>Feedback real-time</span>
              </div>
            </div>
            <Button className="feature-button">
              Coba Demo Interaktif <FaArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
         
          <Card className="feature-card">
            <div className="feature-icon-wrapper">
              <FaChartLine />
            </div>
            <h3 className="feature-title">Analitik Lengkap</h3>
            <p className="feature-description">
              Insight detail dan laporan progress yang bantu guru dan orang tua pantau hasil belajar dan tau area mana yang perlu diperbaiki.
            </p>
            <div className="feature-benefits">
              <div className="benefit-item">
                <FaCheck className="benefit-icon" />
                <span>Laporan progress detail</span>
              </div>
              <div className="benefit-item">
                <FaCheck className="benefit-icon" />
                <span>Analitik performa</span>
              </div>
              <div className="benefit-item">
                <FaCheck className="benefit-icon" />
                <span>Dashboard orang tua & guru</span>
              </div>
            </div>
            <Button className="feature-button">
              Lihat Demo Analitik <FaArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </div>
      </section>

      {/* Character Selection Section */}
      <section className="section-container" id="character-selection">
        <div className="section-header">
          <h2 className="section-title">Pilih Teman Belajar Kamu</h2>
          <p className="section-description">
            Pilih karakter yang cocok sama gaya belajar kamu dan mulai petualangan matematika seru!
          </p>
        </div>
        
        <div className="characters-grid">
          {characters.map((character) => (
            <Card 
              key={character.id} 
              className={`character-card ${selectedCharacterLocal?.id === character.id ? 'selected' : ''} ${character.locked ? 'locked' : ''}`}
              onClick={() => !character.locked && setSelectedCharacterLocal(character)}
            >
              <Avatar className="character-avatar">
                <AvatarImage src={character.avatar} alt={character.name} />
                <AvatarFallback>{character.name[0]}</AvatarFallback>
              </Avatar>
              
              <h3 className="character-name">{character.name}</h3>
              <p className="character-description">{character.description}</p>
              
              <div className="character-abilities">
                {character.abilities?.map((ability, index) => (
                  <div key={index} className="ability-item">
                    <FaCheck className="ability-icon" />
                    <span>{ability}</span>
                  </div>
                ))}
              </div>
              
              {character.locked && (
                <div className="unlock-info">
                  <FaLock className="lock-icon" />
                  <span>Buka di Level {character.unlockLevel}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
        
        <div className="character-cta">
          <Button
            size="lg"
            onClick={() => {
              if (selectedCharacterLocal) {
                setSelectedCharacter(selectedCharacterLocal);
                navigate('/game-selection');
              }
            }}
            className="adventure-button"
            disabled={!selectedCharacterLocal}
          >
            <FaRocket className="mr-2 h-5 w-5" />
            Mulai Petualangan
          </Button>
        </div>
      </section>

      {/* Games Section */}
      <section className="games-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Modul Pembelajaran</h2>
            <p className="section-description">
              Jelajahi koleksi lengkap modul pembelajaran interaktif yang dirancang khusus buat bikin matematika jadi seru dan efektif.
            </p>
          </div>
          
          <div className="games-grid">
            {/* Loops and Logic Module */}
            <Card className="module-card" onClick={() => handleGameClick('iteration')}>
              <div className="module-header">
                <div className="module-icon-wrapper primary">
                  <FaInfinity />
                </div>
                <Badge className="module-badge">Populer</Badge>
              </div>
              
              <h3 className="module-title">Loop dan Logika</h3>
              <p className="module-description">
                Kuasai pola matematika dan pemikiran logis lewat tantangan dan puzzle berbasis loop yang seru.
              </p>
              
              <div className="module-features">
                <div className="feature-item">
                  <FaCheck className="feature-check" />
                  <span>Pengenalan Pola</span>
                </div>
                <div className="feature-item">
                  <FaCheck className="feature-check" />
                  <span>Penalaran Logis</span>
                </div>
                <div className="feature-item">
                  <FaCheck className="feature-check" />
                  <span>Pemecahan Masalah</span>
                </div>
              </div>
              
              <div className="module-stats">
                <div className="stat-item">
                  <FaUsers className="stat-icon" />
                  <span>2.1M siswa</span>
                </div>
                <div className="stat-item">
                  <FaClock className="stat-icon" />
                  <span>45 menit rata-rata</span>
                </div>
              </div>
              
              <Button 
                className="module-button"
                onClick={() => handleGameClick('iteration')}
              >
                <FaPlay className="mr-2 h-4 w-4" />
                Mulai Belajar
              </Button>
            </Card>

            {/* Number Sense Module */}
            <Card className="module-card" onClick={() => handleGameClick('numeration')}>
              <div className="module-header">
                <div className="module-icon-wrapper secondary">
                  <FaCalculator />
                </div>
                <Badge className="module-badge">Inti</Badge>
              </div>
              
              <h3 className="module-title">Kepekaan Angka</h3>
              <p className="module-description">
                Bangun fondasi kuat kemampuan angka lewat aktivitas seru yang mengembangkan intuisi matematika.
              </p>
              
              <div className="module-features">
                <div className="feature-item">
                  <FaCheck className="feature-check" />
                  <span>Operasi Angka</span>
                </div>
                <div className="feature-item">
                  <FaCheck className="feature-check" />
                  <span>Hitung Cepat</span>
                </div>
                <div className="feature-item">
                  <FaCheck className="feature-check" />
                  <span>Hubungan Angka</span>
                </div>
              </div>
              
              <div className="module-stats">
                <div className="stat-item">
                  <FaUsers className="stat-icon" />
                  <span>1.8M siswa</span>
                </div>
                <div className="stat-item">
                  <FaClock className="stat-icon" />
                  <span>35 menit rata-rata</span>
                </div>
              </div>
              
              <Button 
                className="module-button"
                onClick={() => handleGameClick('numeration')}
              >
                <FaPlay className="mr-2 h-4 w-4" />
                Mulai Belajar
              </Button>
            </Card>

            {/* Robot Programming Module */}
            <Card className="module-card" onClick={() => handleGameClick('zeno')}>
              <div className="module-header">
                <div className="module-icon-wrapper tertiary">
                  <FaRobot />
                </div>
                <Badge className="module-badge">Lanjutan</Badge>
              </div>
              
              <h3 className="module-title">Programming Knight</h3>
              <p className="module-description">
                Belajar computational thinking dan konsep programming sambil selesaiin tantangan matematika bareng ksatria.
              </p>
              
              <div className="module-features">
                <div className="feature-item">
                  <FaCheck className="feature-check" />
                  <span>Computational Thinking</span>
                </div>
                <div className="feature-item">
                  <FaCheck className="feature-check" />
                  <span>Desain Algoritma</span>
                </div>
                <div className="feature-item">
                  <FaCheck className="feature-check" />
                  <span>Logika Berurutan</span>
                </div>
              </div>
              
              <div className="module-stats">
                <div className="stat-item">
                  <FaUsers className="stat-icon" />
                  <span>950K siswa</span>
                </div>
                <div className="stat-item">
                  <FaClock className="stat-icon" />
                  <span>60 menit rata-rata</span>
                </div>
              </div>
              
              <Button 
                className="module-button"
                onClick={() => handleGameClick('zeno')}
              >
                <FaPlay className="mr-2 h-4 w-4" />
                Mulai Belajar
              </Button>
            </Card>

            {/* Advanced Mathematics Explorer Module */}
            <Card className="module-card" onClick={() => handleGameClick('wildrealm')}>
              <div className="module-header">
                <div className="module-icon-wrapper quaternary">
                  <FaGraduationCap />
                </div>
                <Badge className="module-badge new">Baru</Badge>
              </div>
              
              <h3 className="module-title">Penjelajah Matematika Lanjutan</h3>
              <p className="module-description">
                Selami konsep matematika lanjutan dengan eksplorasi interaktif dan aplikasi dunia nyata.
              </p>
              
              <div className="module-features">
                <div className="feature-item">
                  <FaCheck className="feature-check" />
                  <span>Konsep Lanjutan</span>
                </div>
                <div className="feature-item">
                  <FaCheck className="feature-check" />
                  <span>Aplikasi Dunia Nyata</span>
                </div>
                <div className="feature-item">
                  <FaCheck className="feature-check" />
                  <span>Eksplorasi Interaktif</span>
                </div>
              </div>
              
              <div className="module-stats">
                <div className="stat-item">
                  <FaUsers className="stat-icon" />
                  <span>425K siswa</span>
                </div>
                <div className="stat-item">
                  <FaClock className="stat-icon" />
                  <span>75 menit rata-rata</span>
                </div>
              </div>
              
              <Button 
                className="module-button"
                onClick={() => handleGameClick('wildrealm')}
              >
                <FaPlay className="mr-2 h-4 w-4" />
                Mulai Belajar
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Siap Bikin Belajar Matematika Jadi Seru?</h2>
            <p className="cta-description">
              Gabung sama jutaan siswa dan guru yang udah ngerasain kekuatan pendidikan matematika berbasis AI. Mulai trial gratis kamu sekarang juga.
            </p>
            
            <div className="cta-testimonials">
              <div className="testimonial">
                <div className="stars">★★★★★</div>
                <p>"Anak saya jadi makin percaya diri sama matematika sejak pakai Rekurno. Pendekatan personalnya beneran manjur!"</p>
                <span>- Sarah M., Orang Tua</span>
              </div>
              <div className="testimonial">
                <div className="stars">★★★★★</div>
                <p>"Sebagai pendidik, saya lihat peningkatan luar biasa dalam keterlibatan dan pemahaman siswa."</p>
                <span>- Bergitta Dwi A., Ph.D, Dosen</span>
              </div>
              <div className="testimonial">
                <div className="stars">★★★★★</div>
                <p>"Analitiknya bantu saya pantau progress anak dan tau area mana yang perlu perhatian lebih."</p>
                <span>- Maria R., Orang Tua</span>
              </div>
            </div>
            
            <div className="cta-buttons">
              <Button
                size="lg"
                onClick={() => navigate('/signup')}
                className="cta-primary-btn"
              >
                <FaRocket className="mr-2 h-5 w-5" />
                Coba Gratis Sekarang
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('features-section')}
                className="cta-secondary-btn"
              >
                <FaEye className="mr-2 h-5 w-5" />
                Pelajari Lebih Lanjut
              </Button>
            </div>
            
            <div className="cta-features">
              <div className="feature-highlight">
                <FaCheck className="feature-check-icon" />
                <span>Gak perlu kartu kredit</span>
              </div>
              <div className="feature-highlight">
                <FaCheck className="feature-check-icon" />
                <span>Trial gratis 14 hari</span>
              </div>
              <div className="feature-highlight">
                <FaCheck className="feature-check-icon" />
                <span>Bisa batal kapan aja</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
