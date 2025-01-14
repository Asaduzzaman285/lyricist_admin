// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Master from './layouts/admin/Master';
// import Login from './components/Auth/Login';

// const App = () => {


//   return (
//     <div className="App">
//       <Router>
//         <Routes>
       
//               <Route path="/*" element={<Master />} />
//               <Route path="login" element={<Login/>} />
     

//         </Routes>
//       </Router>
//     </div>
//   );
// };

// export default App; 



import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Master from './layouts/admin/Master';
import Login from './components/Auth/Login';
import PrivateRoute from './routes/PrivateRoute';


const App = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Master />
              </PrivateRoute>
            }
            // element={
            //   <Master />
            // }
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;