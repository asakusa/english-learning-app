import React from 'react';
import { Scene } from '../types';

interface SceneCardProps {
  scene: Scene;
  onClick: (scene: Scene) => void;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, onClick }) => {
  return (
    <div 
      onClick={() => onClick(scene)}
      className="relative group overflow-hidden rounded-2xl shadow-md cursor-pointer transform transition-transform duration-200 active:scale-95"
    >
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
      <img 
        src={scene.imageUrl} 
        alt={scene.title} 
        className="w-full h-40 object-cover"
        loading="lazy"
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20 text-white">
        <h3 className="font-bold text-lg">{scene.title}</h3>
        <p className="text-xs opacity-90">{scene.description}</p>
      </div>
      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold z-20 uppercase tracking-wide ${scene.color}`}>
        {scene.category}
      </div>
    </div>
  );
};

export default SceneCard;
