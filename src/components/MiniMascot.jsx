export default function MiniMascot({ rootRef }) {
  return (
    <div id="mini-mooca" ref={rootRef}>
      <img className="mini-mood mood-worried" src="/assets/Sad.png" alt="" />
      <img className="mini-mood mood-neutral" src="/assets/Neutral.png" alt="" />
      <img className="mini-mood mood-happy" src="/assets/Happy.png" alt="" />
    </div>
  );
}