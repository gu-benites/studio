
import React from 'react';
import { Leaf } from 'lucide-react';
import { useFormContext } from '@/context/FormContext';

const Header: React.FC = () => {
  const { resetForm } = useFormContext();
  
  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => {
            if (window.confirm('Deseja reiniciar o processo? Todos os dados serão perdidos.')) {
              resetForm();
            }
          }}
        >
          <Leaf className="h-6 w-6 text-aroma-primary" />
          <h1 className="text-xl font-semibold text-aroma-dark">AromaCHAT</h1>
        </div>
        <nav>
          <ul className="flex gap-6">
            <li>
              <a href="#" className="text-aroma-dark hover:text-aroma-primary transition">
                Início
              </a>
            </li>
            <li>
              <a href="#" className="text-aroma-dark hover:text-aroma-primary transition">
                Sobre
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
