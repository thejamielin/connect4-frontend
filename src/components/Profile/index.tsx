import { useEffect, useState } from "react";
import Nav from "../../Nav";
import {
  PictureInfo,
  apiGetCurrentSessionUser,
  apiGetUser,
  apiPictureId,
  apiSetUser,
} from "../../dao";
import { useNavigate, useParams } from "react-router";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { User } from "../../types";

export function SelfProfile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User | false>();

  useEffect(() => {
    apiGetCurrentSessionUser().then((data) => {
      setUserData(data);
    });
  }, []);

  if (userData === undefined) {
    return <div>Loading</div>;
  }

  if (!userData) {
    navigate("/login");
    return <div>Must be logged in. Redirecting...</div>;
  }

  return <Profile username={userData.username} isChill={true} />;
}

export function OtherProfile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User | false>();
  const { username } = useParams();

  useEffect(() => {
    apiGetCurrentSessionUser().then((data) => {
      setUserData(data);
    });
  }, []);

  useEffect(() => {
    if (userData) {
      // are we the person we're looking at?
      const isChill = userData.username === username;
      if (isChill) {
        navigate("/profile");
      }
    }
  }, [username]);

  if (!username) {
    return <div>Loading</div>;
  }

  return <Profile username={username} isChill={false} />;
}

function Profile({
  username,
  isChill,
}: {
  username: string;
  isChill: boolean;
}) {
  const [currentUserData, setCurrentUserData] = useState<User | false>();
  const [userData, setUserData] = useState<User | false>();
  const [amIFollowing, setAmIFollowing] = useState<boolean>(false);
  const [profilePic, setProfilePic] = useState<PictureInfo>();

  const navigate = useNavigate();

  useEffect(() => {
    apiGetCurrentSessionUser().then((data) => {
      setCurrentUserData(data);
    });
  }, []);

  useEffect(() => {
    if (currentUserData) {
      currentUserData.role === "regular" &&
        setAmIFollowing(currentUserData.following.includes(username));
    }
    apiGetUser(username)
      .then((userData) => {
        setUserData(userData);
        if (userData.pfp) {
          apiPictureId(userData.pfp).then((entry: PictureInfo) => {
            setProfilePic(entry);
          });
        }
      })
      .catch(() => {
        setUserData(false);
      });
  }, [username]);

  if (currentUserData === undefined || userData === undefined) {
    return <div>Loading</div>;
  }
  if (!userData) {
    return (
      <div>
        User {username} does not exist!
        <Button onClick={() => navigate("/Home")}>Go Home</Button>
      </div>
    );
  }

  const handleEmailChange = async () => {
    apiSetUser({ email: userData.email }).then((success) => {
      if (!success) {
        throw Error("Cannot update email!");
      }
    });
  };

  const handleFollow = async () => {
    if (currentUserData && currentUserData.role === "regular") {
      const ownFollowing = currentUserData.following;
      if (ownFollowing.includes(username)) {
        currentUserData.following = ownFollowing.filter(
          (followee: string) => followee !== username
        );
      } else {
        currentUserData.following.push(username);
      }
      apiSetUser({ following: currentUserData.following }).then((success) => {
        if (!success) {
          throw Error("Cannot update following list!");
        }
      });
      setAmIFollowing(!amIFollowing);
    }
  };

  const chillUI = () => {
    return (
      <div>
        <p>Username: {username}</p>
        <form>
          <label>
            Email:
            <input
              type="text"
              id="email-field"
              title="Email field"
              value={userData.email}
              onChange={(e) =>
                setUserData({ ...userData, email: e.target.value })
              }
            />
          </label>
        </form>
        <Button onClick={handleEmailChange}>Change Email</Button>
      </div>
    );
  };

  const notChillUI = () => {
    return (
      <div>
        <p>Username: {username}</p>
        {currentUserData && (
          <Button onClick={handleFollow}>
            {amIFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div>
      <Nav loggedIn={!!currentUserData} 
           isBeginner={currentUserData && currentUserData.role === "beginner"} />
      <h1>Profile</h1>
      {userData.role === "regular" && profilePic && (
        <Link to={`/details/${userData.pfp}`}>
          <img
            src={profilePic.previewURL}
            style={{ objectFit: "fill", height: "100%" }}
          />
        </Link>
      )}
      {isChill ? chillUI() : notChillUI()}
      {userData.role === "regular" && (
        <>
          <h2>Followers</h2>
          <ul>
            {userData.following.map((follower: string) => (
              <Link to={`/profile/${follower}`}>
                <li key={follower}>{follower}</li>
              </Link>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
