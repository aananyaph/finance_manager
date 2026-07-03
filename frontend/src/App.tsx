// import { useEffect, useState } from "react";
// import api from "./services/api";

// function App() {
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     api
//       .get("/")
//       .then((res) => {
//         setMessage(res.data.message);
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   }, []);

//   return (
//     <div style={{ padding: "50px" }}>
//       <h1>Finance Manager</h1>
//       <h2>{message}</h2>
//     </div>
//   );
// }

// export default App;

// import Login from "./pages/Login";

// function App() {
//   return <Login />;
// }

// export default App;

import Dashboard from "./pages/Dashboard";

function App() {
  return <Dashboard />;
}

export default App;