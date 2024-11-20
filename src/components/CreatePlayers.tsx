import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import logo1 from '../assets/logo1.png';

// Move Supabase client creation to a separate file

// Extract API calls into a separate service
import {
  fetchPlayers,
  insertPlayer,
  deletePlayer,
} from '../services/playerService';

import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function CreatePlayers() {
  const [value, setValue] = useState('');
  const [displayValues, setDisplayValues] = useState([]);
  const [color, setColor] = useState('#000000');
  const [startGame, setStartGame] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await insertPlayer(value, color);
  };

  const removePlayer = useCallback(async (name) => {
    console.log(name, 'name');
    await deletePlayer(name.name);
  }, []);

  const spring = {
    type: 'spring',
    damping: 40,
    stiffness: 800,
    duration: 0.5,
  };

  useEffect(() => {
    let isMounted = true; // Add this line

    const fetchAndSetPlayers = async () => {
      const players = await fetchPlayers();
      console.log(players, 'players');
      if (isMounted) setDisplayValues(players);
    };

    fetchAndSetPlayers();

    const fetchPlayersFromSupabase = supabase
      .channel('players')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        async (payload) => {
          if (isMounted) fetchAndSetPlayers();
        },
      )
      .subscribe();

    const isGameReady = supabase
      .channel('admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin' },
        async (payload) => {
          console.log(payload, 'payload');
          console.log(
            (payload.new as { startGame: boolean }).startGame,
            'payload',
          );
          setStartGame((payload.new as { startGame: boolean }).startGame);
          console.log(startGame, 'startgame');
        },
      )
      .subscribe();

    console.log(isGameReady, 'isgameraeadt');

    return () => {
      isMounted = false; // Add this line
      supabase.removeChannel(fetchPlayersFromSupabase);
      supabase.removeChannel(isGameReady);
    };
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    startGame ? navigate('/questions/0') : null;
  }, [startGame]);

  return (
    <div className="flex items-center justify-center p-4 mt-5 rounded-xl sm:mt-10 md:p-10">
      <form className="w-full">
        <div className="mb-5">
          <div className="flex items-center mb-4">
            <h1 className="text-4xl font-extrabold leading-none tracking-tight text-white md:text-5xl lg:text-6xl">
              Quizazoid
            </h1>
            <img className="w-32 h-32 " src={logo1} alt="image description" />
          </div>
          <p className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-white">
            Spillere:
          </p>
          {displayValues.map((value, index) => (
            <motion.div
              key={index}
              id={value.name}
              className="inline-flex items-center px-2 py-1 m-1 text-sm font-bold text-white rounded"
              style={{ backgroundColor: value.class }}
              initial={['visible', 'active']}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              exit={{ opacity: 0 }}
              transition={spring}
              animate={['visible', 'active']}
              layout
            >
              {value.name}
              <motion.button
                type="button"
                className="inline-flex items-center p-1 text-sm font-bold text-white bg-transparent rounded-lg ms-2 hover:bg-black hover:text-white "
                data-dismiss-target="#badge-dismiss-green"
                aria-label="Remove"
                onClick={(e) => {
                  removePlayer(value);
                }}
                whileHover={{
                  scale: 1.1,
                  transition: { duration: 1 },
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <svg
                  className="w-3 h-3 font-bold stroke-2 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Remove badge</span>
              </motion.button>
            </motion.div>
          ))}
          <label
            htmlFor="name"
            className="block my-4 text-sm font-medium text-white"
          >
            Dit navn
          </label>
          <input
            type="text"
            id="name"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            placeholder="Navn"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <label
            htmlFor="hs-color-input"
            className="block my-4 text-sm font-medium text-white"
          >
            Vælg farve
          </label>
          <input
            type="color"
            className="block w-1/3 h-10 p-1 bg-white border border-gray-200 rounded-lg cursor-pointer disabled:opacity-50 disabled:pointer-events-none "
            title="Choose your color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            list="colors"
          />
          <datalist id="colors">
            <option>#ef4444</option>
            <option>#a3e635</option>
            <option>#38bdf8</option>
            <option>#6366f1</option>
            <option>#e879f9</option>
            <option>#fb7185</option>
            <option>#22c55e</option>
            <option>#065f46</option>
            <option>#4338ca</option>
            <option>#ea580c</option>
          </datalist>
        </div>

        <motion.button
          type="submit"
          whileHover={{
            scale: 1.1,
            transition: { duration: 1 },
          }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSubmit}
          className="text-white bg-gradient-to-r mt-2 from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Tilføj
        </motion.button>
      </form>
    </div>
  );
}
