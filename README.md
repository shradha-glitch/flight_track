# Journey
This is the repo for **Journey** created for the course **Information Visualization DH2321 @KTH**. The project uses React, D3.js, Python and MaterialUI. 


Contributors:
Amanda Arbinge aarbinge@kth.se
Kristín Hafsteinsdóttir khaf@kth.se
Laieh Jwella laieh@kth.se
Amina-Kamra Maglić maglic@kth.se
Shradha Retharekar shradha@kth.se



## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


## How to run Backend

**Note: Make sure that you are using python version > 3.7. for this project we used python 3.9**

### `pip3 install -r requirements.txt`

Fetches the packages that are required for this project. 
Preferable to not use .venv as fastapi has some issue with it.
Install the remaining packages by hovering on them which will suggest download missing packages

### `py -3 -m uvicorn main:app --reload --port 8001`

Make sure you run this command in the backend folder where the main.py file is present.
so it would be flight_track\backend\
You can change the port if you face any issue.

### `http://127.0.0.1:8001/docs`

Run this in browser and you will see all the available apis for the project. Fastapi comes with the ability to use swagger documentation.




