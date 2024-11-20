import { useEffect, useState, lazy } from 'react';
import logo1 from '../assets/logo1.png';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const backgroundColors = [
  'bg-gradient-to-r from-cyan-500 to-blue-500',
  'bg-gradient-to-r from-sky-500 to-indigo-500',
  'bg-gradient-to-r from-violet-500 to-fuchsia-500',
  'bg-gradient-to-r from-purple-500 to-pink-500',
  'bg-gradient-to-r from-teal-500 to-indigo-500',
  'bg-gradient-to-r from-indigo-500 to-sky-500',
  'bg-gradient-to-r from-rose-500 to-fuchsia-500',
  'bg-gradient-to-r from-lime-500 to-emerald-500',
  'bg-gradient-to-r from-red-500 to-orange-500',
];

const getRandomBackgroundColor = () => {
  const randomIndex = Math.floor(Math.random() * backgroundColors.length);
  return backgroundColors[randomIndex];
};

export default function Scoreboard() {
  const [backgroundColor, setBackgroundColor] = useState('');
  const [playersList, setPlayersList] = useState([]);

  useEffect(() => {
    setBackgroundColor(getRandomBackgroundColor());
  }, []);

  useEffect(() => {
    const checkAndFetchPlayers = async () => {
      // Fetch players from Supabase if not found in sessionStorage
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('points', { ascending: false });

      if (error) console.error('Error fetching scoreboard:', error);
      console.log(data, 'players');
      sessionStorage.setItem('players', JSON.stringify(data));
      setPlayersList(data);
    };

    checkAndFetchPlayers();
  }, []);

  const { id } = useParams();
  const currentId = parseInt(id, 10);

  const handleClick = () => {
    const nextId = currentId + 1;
    navigate(`/scoreboard/${nextId}`);
  };

  console.log(playersList, 'playerslist');

  return (
    <>
      <div className="w-full h-full d-flex">
        <div className="flex items-center justify-center w-full h-full p-6 mb-4">
          <h1 className="text-4xl font-extrabold leading-none tracking-tight text-center text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            Quizazoid
          </h1>
          <img className="w-32 h-32 " src={logo1} alt="image description" />
        </div>

        <div className="flex flex-col items-center self-center justify-center w-full h-full p-6">
          <h2 className="my-4 text-4xl font-extrabold leading-none tracking-tight text-left text-gray-900 md:text-5xl lg:text-5xl dark:text-white">
            Scoreboard
          </h2>
          <div className="relative flex items-center justify-center w-full mt-6 overflow-x-auto rounded-lg shadow-lg">
            <table className="w-full text-sm text-left text-white ">
              <thead
                className={`text-xs text-white font-bold uppercase ${backgroundColor} border-b `}
              >
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 leading-none tracking-tight"
                  >
                    Spillere
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 leading-none tracking-tight"
                  >
                    Point
                  </th>
                </tr>
              </thead>
              <tbody>
                {playersList.map(function (data) {
                  return (
                    <tr className={`${backgroundColor} border-b`} key={data.id}>
                      <td className="w-1/2 px-6 py-4 font-bold leading-none tracking-tight text-gray-900 whitespace-nowrap dark:text-white">
                        {data.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center mt-4">
                          <span className="text-sm font-bold leading-none tracking-tight text-white">
                            {data.points}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
