export default function FragmentCard({ f }) {
  const toneClass = f.tone ? ` tone-${f.tone}` : '';

  if (f.type === 'photostrip') {
    const cells = f.images || [f.c1, f.c2, f.c3, f.c4];
    return (
      <div className={`card${toneClass} type-photostrip`} style={{ background: f.backing }}>
        {cells.map((c, i) =>
          f.images ? (
            <div className="strip-cell" key={i}><img src={c} alt="" /></div>
          ) : (
            <div className="strip-cell" key={i} style={{ background: c }} />
          )
        )}
      </div>
    );
  }

  if (f.type === 'receipt') {
    return (
      <div className={`card${toneClass} type-receipt`}>
        <div className="receipt-title">RECEIPTIFY</div>
        <div className="receipt-sub">LAST 6 MONTHS</div>
        {(f.lines || []).map((l, i) => (
          <div className="receipt-line" key={i}>{l}</div>
        ))}
      </div>
    );
  }

  if (f.type === 'sticky') {
    return (
      <div className={`card${toneClass} type-sticky`}>
        <div className="sticky-tape" />
        {f.img && <img className="sticky-doodle-img" src={f.img} alt="" />}
        {!f.img && f.doodle && <div className="sticky-doodle">{f.doodle}</div>}
        {f.lines ? (
          <div className="sticky-lines" dangerouslySetInnerHTML={{ __html: f.lines.join('<br>') }} />
        ) : f.text ? (
          <div>{f.text}</div>
        ) : null}
      </div>
    );
  }

  if (f.type === 'polaroid') {
    return (
      <div className={`card${toneClass} type-polaroid`}>
        <div className="polaroid-photo">
          {f.photoSrc ? <img src={f.photoSrc} alt="" /> : <div style={{ width: '100%', height: '100%', background: f.photoColor }} />}
        </div>
        <div className="polaroid-caption">{f.text}</div>
      </div>
    );
  }

  if (f.type === 'reframe') {
    return (
      <div className={`card${toneClass} type-reframe`}>
        <div className="reframe-prefix">I'm having the thought that…</div>
        <div className="reframe-main">{f.text}</div>
      </div>
    );
  }

  return <div className={`card${toneClass} type-bubble`}>{f.text}</div>;
}