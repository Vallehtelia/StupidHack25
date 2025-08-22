import React, { useState, useEffect, useRef, useCallback } from 'react';
import './NokiaCaptchaModal.css';
import nokiaPhone from '../assets/nokia3310-portrait.png';
import ringtoneAudio from '../assets/Nokia - Kick Ringtone.mp3';

const NokiaCaptchaModal = ({ onSuccess, onFailure }) => {
  const [score, setScore] = useState(0);
  const [battery, setBattery] = useState(40);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'paused', 'battery-dead', 'won'
  const [showSMS, setShowSMS] = useState(false);
  const [phoneDimensions, setPhoneDimensions] = useState({ width: 0, height: 0 });
  
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const batteryTimerRef = useRef(null);
  const smsTimerRef = useRef(null);
  const directionRef = useRef({ x: -1, y: 0 });
  const appleRef = useRef({ x: 7, y: 7 });
  const phoneImageRef = useRef(null);
  
  const ringtoneRef = useRef(new Audio(ringtoneAudio));
  const handleWinRef = useRef();
  
  const GRID_SIZE = 8;
  const GAME_SPEED = 200;
  const TARGET_SCORE = 2;
  
  // Game state
  const [snake, setSnake] = useState([{ x: 2, y: 2 }]);
  const [direction, setDirection] = useState({ x: -1, y: 0 });
  const [apple, setApple] = useState({ x: 7, y: 7 });
  const [lastMoveTime, setLastMoveTime] = useState(0);
  
  // Calculate responsive positions based on phone image dimensions
  const getResponsivePosition = (originalX, originalY) => {
    if (phoneDimensions.width === 0 || phoneDimensions.height === 0) return { x: 0, y: 0 };
    
    // Convert from 540x1250 to current phone dimensions
    const scaleX = phoneDimensions.width / 540;
    const scaleY = phoneDimensions.height / 1250;
    
    return {
      x: originalX * scaleX,
      y: originalY * scaleY
    };
  };
  
  // Update phone dimensions when image loads
  useEffect(() => {
    const handleImageLoad = () => {
      if (phoneImageRef.current) {
        const rect = phoneImageRef.current.getBoundingClientRect();
        setPhoneDimensions({ width: rect.width, height: rect.height });
      }
    };
    
    if (phoneImageRef.current) {
      handleImageLoad();
    }
    
    // Also handle window resize
    const handleResize = () => {
      handleImageLoad();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Keep refs in sync with state
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);
  
  useEffect(() => {
    appleRef.current = apple;
  }, [apple]);
  
  // Initialize game state
  useEffect(() => {
    setGameState('playing');
    setScore(0);
    setBattery(40);
    setSnake([{ x: 2, y: 2 }]);
    setDirection({ x: 1, y: 0 });
    setApple({ x: 7, y: 7 });
    setLastMoveTime(0);
    
    return () => {
      stopGame();
    };
  }, []);
  
  // Battery drain timer
  useEffect(() => {
    if (gameState === 'playing') {
      batteryTimerRef.current = setInterval(() => {
        setBattery(prev => {
          if (prev <= 1) {
            setGameState('battery-dead');
            // Don't count battery death as failure - let user recharge
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (batteryTimerRef.current) {
        clearInterval(batteryTimerRef.current);
      }
    };
  }, [gameState]);
  
  // Random SMS distraction
  useEffect(() => {
    if (gameState === 'playing' && Math.random() < 0.1) {
      smsTimerRef.current = setTimeout(() => {
        setShowSMS(true);
        setTimeout(() => setShowSMS(false), 2000);
      }, Math.random() * 10000 + 5000);
    }
    
    return () => {
      if (smsTimerRef.current) {
        clearTimeout(smsTimerRef.current);
      }
    };
  }, [gameState]);
  
  const stopGame = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    if (batteryTimerRef.current) {
      clearInterval(batteryTimerRef.current);
    }
    if (smsTimerRef.current) {
      clearTimeout(smsTimerRef.current);
    }
  };
  
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setBattery(100);
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 1, y: 0 });
    setApple({ x: 7, y: 7 });
    setLastMoveTime(0);
    
    // Clear any existing interval
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
  };
  
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;
    
    const now = Date.now();
    if (now - lastMoveTime < GAME_SPEED) return;
    
    setLastMoveTime(now);
    
    // Debug log - use ref to get current direction
    console.log('Game loop running, direction:', directionRef.current, 'snake:', snake);
    
    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      const currentDirection = directionRef.current; // Get current direction from ref
      
      // Move head
      head.x += currentDirection.x;
      head.y += currentDirection.y;
      
      // Wrap around edges
      if (head.x < 0) head.x = GRID_SIZE - 1;
      if (head.x >= GRID_SIZE) head.x = 0;
      if (head.y < 0) head.y = GRID_SIZE - 1;
      if (head.y >= GRID_SIZE) head.y = 0;
      
      // Check collision with self
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameState('paused');
        return prevSnake;
      }
      
      newSnake.unshift(head);
      
      // Check if apple eaten
      if (head.x === appleRef.current.x && head.y === appleRef.current.y) {
        setScore(prev => {
          const newScore = prev + 1;
          if (newScore >= TARGET_SCORE) {
            handleWinRef.current();
          }
          return newScore;
        });
        
        // Generate new apple
        setApple({
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE)
        });
      } else {
        newSnake.pop();
      }
      
      return newSnake;
    });
  }, [gameState, lastMoveTime, GAME_SPEED, snake]); // Removed apple from dependencies
  
  const handleWin = useCallback(() => {
    setGameState('won');
    stopGame();
    
    // Play ringtone and wait for it to finish
    try {
      ringtoneRef.current.currentTime = 0;
      ringtoneRef.current.play();
      
      // Wait for ringtone to finish before redirecting
      ringtoneRef.current.onended = () => {
        onSuccess();
      };
      
      // Fallback: if onended doesn't fire, redirect after ringtone duration
      const ringtoneDuration = ringtoneRef.current.duration * 1000 || 3000; // Default to 3 seconds if duration unknown
      setTimeout(() => {
        onSuccess();
      }, ringtoneDuration);
      
    } catch {
      console.log('Audio autoplay blocked');
      // If audio fails, redirect immediately
      onSuccess();
    }
  }, [onSuccess]);
  
  // Store handleWin in ref to avoid circular dependencies
  useEffect(() => {
    handleWinRef.current = handleWin;
  }, [handleWin]);
  
  // Start game loop after gameLoop function is defined
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, GAME_SPEED);
    }
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);
  
  const handleDirectionChange = (newDirection) => {
    console.log('Direction change:', newDirection); // Debug log
    
    // Don't allow direction changes if game is not playing
    if (gameState !== 'playing') {
      console.log('Game not playing, direction change ignored');
      return;
    }
    
    // Prevent reverse direction
    if (direction.x !== 0 && newDirection.x !== 0) {
      console.log('Reverse direction prevented'); // Debug log
      return;
    }
    if (direction.y !== 0 && newDirection.y !== 0) {
      console.log('Reverse direction prevented'); // Debug log
      return;
    }
    
    // Set direction immediately
    setDirection(newDirection);
    console.log('Direction set to:', newDirection); // Debug log
  };
  
  const rechargeBattery = () => {
    setBattery(100);
    setGameState('playing');
    
    // Restart the game loop
    if (!gameLoopRef.current) {
      gameLoopRef.current = setInterval(gameLoop, GAME_SPEED);
    }
  };
  
  const handleClose = () => {
    onFailure();
  };
  
  // Render game canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Calculate responsive canvas size based on screen dimensions
    const screenElement = canvas.parentElement;
    if (!screenElement) return;
    
    const screenRect = screenElement.getBoundingClientRect();
    const canvasSize = Math.min(screenRect.width - 16, screenRect.height - 16); // Account for padding
    
    // Always maintain 14x14 grid, scale cell size to fit canvas
    // Ensure minimum cell size to prevent drawing issues
    const cellSize = Math.max(canvasSize / GRID_SIZE, 8);
    
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#aee0a5';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // Draw grid lines
    ctx.strokeStyle = '#8bc34a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvasSize);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvasSize, i * cellSize);
      ctx.stroke();
    }
    
    // Draw snake
    ctx.fillStyle = '#2e7d32';
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Head
        ctx.fillStyle = '#1b5e20';
      } else {
        ctx.fillStyle = '#2e7d32';
      }
      ctx.fillRect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        Math.max(cellSize - 2, 1), // Ensure width is always positive
        Math.max(cellSize - 2, 1)  // Ensure height is always positive
      );
    });
    
    // Draw apple
    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    ctx.arc(
      appleRef.current.x * cellSize + cellSize / 2,
      appleRef.current.y * cellSize + cellSize / 2,
      Math.max(cellSize / 2 - 2, 1), // Ensure radius is always positive
      0,
      2 * Math.PI
    );
    ctx.fill();
    
  }, [snake, apple, phoneDimensions]);
  
  return (
    <div className="nokia-modal-overlay">
      <div className="nokia-modal">
        <div className="nokia-phone-container">
          <img 
            src={nokiaPhone} 
            alt="Nokia 3310" 
            className="nokia-phone" 
            ref={phoneImageRef}
          />
          
          {/* Screen overlay positioned exactly over the PNG screen */}
          <div className="nokia-screen">
            {/* Score and Battery */}
            <div className="screen-header">
              <div className="score">Score: {score}</div>
              <div className="battery">
                <div className="battery-bar">
                  <div 
                    className="battery-level" 
                    style={{ width: `${battery}%` }}
                  ></div>
                </div>
                <span>{battery}%</span>
              </div>
            </div>
            
            {/* Game Canvas */}
            <div className="game-area">
              <canvas 
                ref={canvasRef}
                className="game-canvas"
              />
            </div>
            
            {/* Game Status */}
            {gameState === 'paused' && (
              <div className="game-status">
                <p>Game Paused</p>
                <button onClick={startGame} className="nokia-button">
                  Continue
                </button>
              </div>
            )}
            
            {gameState === 'won' && (
              <div className="game-status won">
                <p>CAPTCHA PASSED!</p>
                <p>Playing ringtone...</p>
              </div>
            )}
            
            {gameState === 'battery-dead' && (
              <div className="game-status battery-dead">
                <p>Battery empty.</p>
                <p>Insert €1.99 to recharge.</p>
                <div className="battery-buttons">
                  <button onClick={rechargeBattery} className="nokia-button">
                    Pay Now
                  </button>
                  <button onClick={rechargeBattery} className="nokia-button">
                    Borrow Charger
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Control buttons positioned exactly over the PNG buttons */}
          <button 
            className="control-button up"
            onClick={() => handleDirectionChange({ x: 0, y: -1 })}
            aria-label="Move Up"
            style={{
              left: getResponsivePosition(270, 860).x,
              top: getResponsivePosition(270, 860).y
            }}
          >
            ↑
          </button>
          <button 
            className="control-button down"
            onClick={() => handleDirectionChange({ x: 0, y: 1 })}
            aria-label="Move Down"
            style={{
              left: getResponsivePosition(270, 1040).x,
              top: getResponsivePosition(270, 1040).y
            }}
          >
            ↓
          </button>
          <button 
            className="control-button left"
            onClick={() => handleDirectionChange({ x: -1, y: 0 })}
            aria-label="Move Left"
            style={{
              left: getResponsivePosition(120, 930).x,
              top: getResponsivePosition(120, 930).y
            }}
          >
            ←
          </button>
          <button 
            className="control-button right"
            onClick={() => handleDirectionChange({ x: 1, y: 0 })}
            aria-label="Move Right"
            style={{
              left: getResponsivePosition(430, 930).x,
              top: getResponsivePosition(430, 930).y
            }}
          >
            →
          </button>
          
          {/* Close button */}
          <button 
            className="close-button"
            onClick={handleClose}
            aria-label="Close CAPTCHA"
          >
            ✕
          </button>
        </div>
        
        {/* SMS Distraction */}
        {showSMS && (
          <div className="sms-overlay">
            <div className="sms-content">
              <p>SMS: Mom—Bring milk</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NokiaCaptchaModal;
