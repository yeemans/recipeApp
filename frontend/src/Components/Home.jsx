import { useParams } from 'react-router-dom';

function Home() {
    const { username } = useParams();
    return(
        <div>
            <p>Welcome {username}</p>
        </div>
    )
}

export default Home;