import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Material UI imports
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Add scroll event listener to create floating effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 3, height: '100%' }}>
      <Typography 
        variant="h5" 
        sx={{ 
          my: 3, 
          color: 'white', 
          fontWeight: 900,
          textShadow: '0 2px 10px rgba(124, 58, 237, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>🚀</span>
        BrainQuests
      </Typography>
      <List sx={{ mt: 4 }}>
        <ListItem disablePadding sx={{ mb: 2 }}>
          <ListItemButton 
            component={Link} 
            to="/login" 
            sx={{ 
              textAlign: 'center', 
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              py: 1.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(124, 58, 237, 0.2)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
              }
            }}
          >
            <ListItemText 
              primary="Login" 
              sx={{ 
                '& .MuiListItemText-primary': {
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  color: 'white'
                }
              }} 
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            to="/signup" 
            sx={{ 
              textAlign: 'center', 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(45, 63, 222, 0.8) 0%, rgba(124, 58, 237, 0.8) 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              py: 1.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(45, 63, 222, 0.9) 0%, rgba(124, 58, 237, 0.9) 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(124, 58, 237, 0.4)'
              }
            }}
          >
            <ListItemText 
              primary="Sign Up" 
              sx={{ 
                '& .MuiListItemText-primary': {
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  color: 'white'
                }
              }} 
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="fixed"
      className={scrolled ? 'navbar-scrolled' : ''}
      sx={{ 
        // Enhanced glassmorphism with better transparency and blur
        background: scrolled ? 'rgba(15, 15, 25, 0.85)' : 'rgba(15, 15, 25, 0.75)',
        backdropFilter: scrolled ? 'blur(30px) saturate(180%)' : 'blur(25px) saturate(150%)',
        WebkitBackdropFilter: scrolled ? 'blur(30px) saturate(180%)' : 'blur(25px) saturate(150%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '0 0 20px 20px',
        boxShadow: scrolled 
          ? '0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 25px rgba(45, 63, 222, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
          : '0 15px 45px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(45, 63, 222, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        // Gradient overlay for enhanced glassmorphism
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          background: 'linear-gradient(135deg, rgba(45, 63, 222, 0.1) 0%, rgba(124, 58, 237, 0.08) 50%, rgba(6, 182, 212, 0.1) 100%)',
          borderRadius: 'inherit',
          opacity: scrolled ? 0.9 : 1,
        },
        // Subtle inner glow
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: '1px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 50%, rgba(255, 255, 255, 0.02) 100%)',
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 1,
        },
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transform: scrolled ? 'translateY(0) scale(1)' : 'translateY(0) scale(1)',
        width: '100%',
        left: 0,
        right: 0,
        top: 0,
        margin: 0,
        zIndex: 1100
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo for all screen sizes */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontFamily: '"Inter", "Segoe UI", sans-serif', // Matching body font from App.css
                  fontWeight: 900,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  textShadow: '0 2px 10px rgba(124, 58, 237, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    textShadow: '0 2px 15px rgba(124, 58, 237, 0.5)',
                  }
                }}
              >
                <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 2px 5px rgba(124, 58, 237, 0.4))' }}>🚀</span>
                <span className="navbar-brand-text">BrainQuests</span>
              </Typography>
            </Link>
          </Box>

          {/* Desktop Auth Buttons with Glassmorphism */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {/* Login Button */}
            <Button 
              component={Link} 
              to="/login" 
              variant="outlined"
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '8px 20px',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                letterSpacing: '0.5px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': { 
                  borderColor: 'rgba(124, 58, 237, 0.8)', 
                  background: 'rgba(124, 58, 237, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)'
                } 
              }}
            >
              Login
            </Button>
            
            {/* Sign Up Button */}
            <Button 
              component={Link} 
              to="/signup" 
              variant="contained"
              sx={{ 
                background: 'linear-gradient(135deg, rgba(45, 63, 222, 0.8) 0%, rgba(124, 58, 237, 0.8) 100%)',
                backgroundSize: '200% auto',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '8px 24px',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                letterSpacing: '0.5px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': { 
                  backgroundPosition: 'right center',
                  boxShadow: '0 6px 15px rgba(124, 58, 237, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-2px)'
                } 
              }}
            >
              Sign Up
            </Button>
          </Box>

          {/* Mobile Hamburger Icon */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(124, 58, 237, 0.2)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
                }
              }}
            >
              <MenuIcon sx={{ fontSize: '1.5rem' }} />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            background: 'rgba(15, 15, 25, 0.95)',
            backdropFilter: 'blur(25px) saturate(180%)',
            WebkitBackdropFilter: 'blur(25px) saturate(180%)',
            border: 'none',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.3)',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(45, 63, 222, 0.08) 0%, rgba(124, 58, 237, 0.06) 50%, rgba(6, 182, 212, 0.08) 100%)',
              zIndex: -1
            }
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;