import audioFile from '../../public/audio/cliks.mp3';

function popSound() {
  const audio = new Audio(audioFile);
  audio.play();
}

export default popSound;
