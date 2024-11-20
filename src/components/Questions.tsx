import { useEffect, useState, lazy } from 'react';
import { client } from '../services/sanityClient';
import { motion } from 'framer-motion';
import logo1 from '../assets/logo1.png';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { fetchPlayers } from '../services/playerService';

const Countdown = lazy(() => import('../components/Countdown'));

export default function Questions() {
  const [answerData, setAnswers] = useState([]);
  const [question, setQuestion] = useState('');
  const [questionImage, setQuestionImage] = useState('');
  const { id } = useParams(); // Get the route parameter
  const [startTime, setStartTime] = useState(Date.now());
  const [points, setPoints] = useState(0);

  useEffect(() => {
    let isMounted = true; // Add this line

    if (isMounted) {
      getQuestionsFromSanity();
    }

    return () => {
      isMounted = false; // Add this line
    };
  }, []);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const getQuestionsFromSanity = async () => {
    try {
      const query = `*[_type == "questions"] {
        title,
        image {
          asset-> {
            url
          }
        },
        Questions
      }`;
      client.fetch(query).then((questions) => {
        console.log(questions, 'questions');
        console.log(questions[id], 'questions[id]');

        setQuestion(questions[id].title);
        setQuestionImage(
          questions[id].image.asset.url + '?h=500&max-h=600&format=webp',
        );
        setAnswers(questions[id].Questions);
      });
    } catch (error) {
      console.error(error);
    }
  };

  console.log(answerData, 'answerData');

  const navigate = useNavigate();

  useEffect(() => {
    const checkAndFetchPlayers = async () => {
      let players = JSON.parse(sessionStorage.getItem('players')) || [];

      if (players.length === 0) {
        // Fetch players from Supabase if not found in sessionStorage
        players = await fetchPlayers();
        console.log(players, 'players');
        sessionStorage.setItem('players', JSON.stringify(players));
      }
    };

    checkAndFetchPlayers();
  }, []);

  const handleClick = async (isCorrect) => {
    event.preventDefault();
    let players = JSON.parse(sessionStorage.getItem('players')) || [];

    if (players.length === 0) {
      console.error('No players found');
      return;
    }

    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000; // Time in seconds

    console.log(isCorrect, 'isCorrect');

    let earnedPoints = 0;
    if (isCorrect) {
      earnedPoints = Math.max(1000 - timeTaken * 100, 0); // Example scoring logic
      earnedPoints = Math.round(earnedPoints); // Round to the nearest whole number
    }

    console.log(earnedPoints, 'earnedPoints');

    setPoints((prevPoints) => prevPoints + earnedPoints);

    // Needs to run in firefox otherwise this code doesent work for some reason...
    try {
      // Update points for each player in Supabase
      const updates = players.map(async (player) => {
        const { data, error } = await supabase
          .from('players')
          .update({ points: earnedPoints })
          .eq('id', player.id)
          .select('*');

        if (error) {
          throw error;
        }

        return data;
      });

      const results = await Promise.all(updates);
      console.log('Points updated for all players:', results);
      navigate(`/scoreboard/${id}`);
    } catch (error) {
      console.error('Error updating points:', error);
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full p-6 mb-4">
      <div className="flex items-center justify-center w-full h-full p-4">
        <h1 className="text-4xl font-extrabold leading-none tracking-tight text-white md:text-5xl lg:text-6xl">
          Quizazoid
        </h1>
        <img className="w-32 h-32 " src={logo1} alt="image description" />
      </div>

      <h2 className="my-6 text-4xl font-extrabold leading-none tracking-tight text-center text-white md:my-10 md:text-5xl ">
        {question}
      </h2>
      <Countdown></Countdown>
      <img
        className="h-auto max-w-full my-4 rounded-lg"
        src={questionImage}
        alt={question}
      />

      <form className="flex flex-wrap items-center justify-center w-full h-full lg:w-1/2">
        {answerData.map(function (data) {
          return (
            <motion.div
              whileHover={{
                scale: 1.1,
                transition: { duration: 1 },
              }}
              whileTap={{ scale: 0.9 }}
              key={data._key}
              className="flex w-full my-4 lg:w-1/2"
            >
              <button
                className="w-full h-full p-20 m-4 text-3xl font-extrabold leading-none tracking-tight text-white rounded-lg shadow"
                style={{ backgroundColor: data.backgroundColor.hex }}
                onClick={() => handleClick(data.korrekt)}
              >
                {data.answer}
              </button>
            </motion.div>
          );
        })}
      </form>
    </div>
  );
}
