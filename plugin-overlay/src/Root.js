import { useEffect, useState } from 'preact/hooks';

import MiniStatus from './MiniStatus.js';

function toState(compilers) {
  return JSON.parse(JSON.stringify(compilers.map((s) => s.state)));
}

export default function Root({ manager }) {
  const [compilers, setCompilers] = useState(toState(manager.compilers));
  // TODO :: listen to errors
  const [errors] = useState([]);

  useEffect(() => {
    return manager.addListener((newData) => {
      setCompilers(toState(newData));
    });
  }, []);

  return (
    <div>
      <MiniStatus compilers={compilers} errors={errors} />
    </div>
  );
}
