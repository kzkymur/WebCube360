import React, { useCallback, useEffect, useRef, } from 'react';

const width = 500;
const height = 500;

const Canvas = props => {
  const canvasRef = useRef(null);

  const getContext = () => {
    const canvas = canvasRef.current;
    return canvas.getContext('webgl');
  };

  const onMouseMove = useCallback((e) => {
    return props.onMouseMove(canvasRef.current)(e);
  }, [canvasRef.current]);

  useEffect(() => {
    const gl = getContext();
    console.log(gl);
    props.render(gl);
  });

  return (
    <canvas
      ref={canvasRef} width={width} height={height}
      onMouseMove={onMouseMove}
    />
  );
}

export default Canvas;
