import { supabase } from './supabaseClient';

export const fetchPlayers = async () => {
  const { data, error } = await supabase.from('players').select('*');
  if (error) {
    console.error(error);
    return [];
  }
  return data.map((player) => ({
    name: player.name,
    class: player.class,
    isReady: player.isReady,
    id: player.id,
    points: player.points,
    createdAt: player.created_at,
  }));
};

export const insertPlayer = async (name, color) => {
  const { data, error } = await supabase
    .from('players')
    .insert({ name, class: color, isReady: true, points: 0 })
    .select();
  if (error) {
    console.error(error);
  } else {
    console.log(data, 'data');
    // Add player to sessionStorage
    const players = JSON.parse(sessionStorage.getItem('players')) || [];
    players.push({
      name,
      class: color,
      isReady: true,
      points: 0,
      id: data[0].id,
      createdAt: data[0].created_at,
    });
    sessionStorage.setItem('players', JSON.stringify(players));
  }
};

export const deletePlayer = async (name) => {
  const { data, error } = await supabase
    .from('players')
    .delete()
    .eq('name', name);
  if (error) {
    console.error(error);
  } else {
    // Remove player from sessionStorage
    const players = JSON.parse(sessionStorage.getItem('players')) || [];
    const updatedPlayers = players.filter((player) => player.name !== name);
    sessionStorage.setItem('players', JSON.stringify(updatedPlayers));
  }
};
