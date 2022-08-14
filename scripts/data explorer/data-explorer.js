/*
  Processes results while inside an editing query page in Stack Exchange Data Explorer
  It must be executed under the console pane and user must also be logged in
  Permission needs to be given(allowed) to the page for downloading many files
*/

let tagNames = [
  // ["rx-java", "rx-java2", "rx-java3"], //rxjava
  // ["rxjs", "rxjs5", "rxjs6", "rxjs7"], //rxjs
  // ["rx-swift"], //rxswift
  ["combine"]
];

// loads the in-page CodeMirror instance
const editor = document.querySelector('.CodeMirror').CodeMirror;

function buildQuery(tagName) {
  return `SELECT p.* 
  FROM   posts p 
  WHERE  p.posttypeid = 1 
         AND p.creationdate >= CONVERT (DATETIME, '2019-01-01', 20) 
         AND ( p.tags LIKE '%<combine>%' 
                OR ( p.tags LIKE '%<swift>%' 
                     AND p.tags LIKE '%<publisher>%' ) 
                OR ( p.tags LIKE '%<swift>%' 
                     AND ( ( p.body LIKE '%' + 'AnyPublisher' + '%' 
                              OR p.title LIKE '%' + 'AnyPublisher' + '%' ) 
                            OR ( p.body LIKE '%' + 'AnyCancellable' + '%' 
                                  OR p.title LIKE '%' + 'AnyCancellable' + '%' ) 
                            OR ( p.body LIKE '%' + 'PassthroughSubject' + '%' 
                                  OR p.title LIKE '%' + 'PassthroughSubject' + '%' 
                               ) 
                            OR ( p.body LIKE '%' + 'import Combine' + '%' 
                                  OR p.title LIKE '%' + 'import Combine' + '%' ) ) 
                   ) ) 
  ORDER  BY p.id `;
}

function buildQueryWithAnswers(tagName) {
  return `SELECT p.* 
  FROM   posts p 
  WHERE  p.posttypeid = 1 
         AND p.creationdate >= CONVERT (DATETIME, '2019-01-01', 20)
         AND p.acceptedanswerid IS NOT NULL
         AND ( p.tags LIKE '%<combine>%' 
                OR ( p.tags LIKE '%<swift>%' 
                     AND p.tags LIKE '%<publisher>%' ) 
                OR ( p.tags LIKE '%<swift>%' 
                     AND ( ( p.body LIKE '%' + 'AnyPublisher' + '%' 
                              OR p.title LIKE '%' + 'AnyPublisher' + '%' ) 
                            OR ( p.body LIKE '%' + 'AnyCancellable' + '%' 
                                  OR p.title LIKE '%' + 'AnyCancellable' + '%' ) 
                            OR ( p.body LIKE '%' + 'PassthroughSubject' + '%' 
                                  OR p.title LIKE '%' + 'PassthroughSubject' + '%' 
                               ) 
                            OR ( p.body LIKE '%' + 'import Combine' + '%' 
                                  OR p.title LIKE '%' + 'import Combine' + '%' ) ) 
                   ) ) 
  ORDER  BY p.id `;
}

function writeQuery(query) {
  editor.clearHistory();
  editor.setValue(query);
}

function timeoutPromiseResolve(interval) {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve();
    }, interval);
  });
};

function verifyResult(timer) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(function () {
      let errorElem = document.getElementById("error-message");
      let loading = document.getElementById("loading");
      if (errorElem.style.display != 'none') {
        reject(new Error(errorElem));
        clearInterval(interval);
      } else {
        if (loading.style.display == 'none') {
          resolve();
          clearInterval(interval);
        }
      }
    }, timer);
  });
};

async function processQuery(query) {
  console.log("Processing query...");
  writeQuery(query);
  document.getElementById("submit-query").click();
  await verifyResult(5000); //5s
}

function execute(builder, dist) {
  return async function () {
    try {
      for (let j = 0; j < tagNames[dist].length; j++) {
        await processQuery(builder(tagNames[dist][j]));
        document.getElementById("resultSetsButton").click();
        if (j + 1 !== tagNames[dist].length)
          await timeoutPromiseResolve(5000); //5s
      }
      console.log("Done!");
    } catch (e) {
      console.log(e);
    }
  }
}

async function executeQuery(dist = 0) {
  await execute(buildQuery, dist)()
  await execute(buildQueryWithAnswers, dist)()
}

executeQuery(0); //combine
// executeQuery(0); //rxjava
//executeQuery(1); //rxjs
//executeQuery(2); //rxswift