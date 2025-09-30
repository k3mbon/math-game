import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacter } from '../contexts/CharacterContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { FaInfinity, FaCalculator, FaRobot, FaGlobe } from 'react-icons/fa';

const GameStart = () => {
  const navigate = useNavigate();
  const { selectedCharacter } = useCharacter();

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8 lg:p-12">
      <section className="container px-4 md:px-6">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">Start Your Math Adventure</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Companion</h2>
            {selectedCharacter ? (
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedCharacter.image} alt={selectedCharacter.name} />
                  <AvatarFallback>{selectedCharacter.name?.slice(0,2) ?? 'AI'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-lg font-medium">{selectedCharacter.name}</div>
                  <div className="text-muted-foreground text-sm">{selectedCharacter.description}</div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No companion selected. Choose one on the landing page.</div>
            )}
            <div className="mt-4">
              <Button variant="outline" onClick={() => navigate('/')}>Change Companion</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Pick a Mode</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button className="justify-start" onClick={() => navigate('/iteration')}>
                <FaInfinity className="mr-2" /> Loop Land
              </Button>
              <Button className="justify-start" onClick={() => navigate('/numeration')}>
                <FaCalculator className="mr-2" /> Number World
              </Button>
              <Button className="justify-start" onClick={() => navigate('/zeno')}>
                <FaRobot className="mr-2" /> ZENO Programming
              </Button>
              <Button className="justify-start" onClick={() => navigate('/open-world-game')}>
                <FaGlobe className="mr-2" /> Adventure World
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default GameStart;
