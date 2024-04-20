import { useEffect, useState } from "react";
import Nav from "../../Nav";
import { PictureInfo, apiGetCurrentSessionUser, apiPictureId, apiSetUser } from "../../dao";
import { useNavigate, useParams } from "react-router";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./index.css"
import TempMessage from "../Util/TempMessage";
import { User } from "../../types";

function Details() {
  const { imageID } = useParams();
  const [userData, setUserData] = useState<User | false>();
  const [entryData, setEntryData] = useState<PictureInfo | 'invalid'>();
  const [pfpSet, setPfpSet] = useState<boolean>(false);

  const navigate = useNavigate()

  useEffect(() => {
    apiGetCurrentSessionUser().then((data) => {
      setUserData(data)
      if (!!data && data.role === "beginner") {
        navigate("/home")
      }
    })
  }, [pfpSet]);

  useEffect(() => {
    if (!imageID) {
      setEntryData('invalid');
      return;
    }
    apiPictureId(imageID).then(result => setEntryData(result)).catch(() => setEntryData('invalid'));
  }, []);

  if (userData === undefined || entryData === undefined) {
    return <TempMessage text="Loading..."/>;
  }

  const setProfilePicture = () => {
    entryData !== 'invalid' && apiSetUser({ pfp: entryData.id + '' }).then(() => setPfpSet(true));
  }

  function SetPfpButton() {
    if (!userData) {
      return <Button disabled={true}>Log in to Set as Profile Picture</Button>;
    }
    if (pfpSet) {
      return <Button disabled={true}>Profile Picture Already Set!</Button>;
    }
    return <Button onClick={setProfilePicture}>Set as Profile Picture</Button>;
  }

  return (
    <div style={{overflow: "hidden"}}>
      <Nav userData={userData}/>
      <div className="details-page">
        {entryData === 'invalid' ?
        <>
          <Button onClick={() => navigate('/search')}>
            {"< Search"}
          </Button>
          <TempMessage text="This image does not exist"/>
        </>
        :
        <div style={{display: "flex"}}>
          <div className="img-container">
            <Button onClick={() => navigate('/search')}>
              {"< Search"}
            </Button>
            <div>
              <img className="img" src={entryData.webformatURL} />
            </div>
          </div>
          <div>
            <h1>Details</h1>
            <div>
              <h2>Image #{entryData.id}</h2>
              <h4>Artist: {entryData.user} &nbsp; Views: {entryData.views} &nbsp; Tags: {entryData.tags}</h4>
            </div>
            <Link to={entryData.pageURL}>{entryData.pageURL}</Link>
            <div style={{paddingTop: "10px"}}>
              <SetPfpButton/>
            </div>
            {userData &&
              <div>
                Liked by: 
                <ul>
                  {entryData.likes.length === 0 ?
                    "No one :("
                    :
                    entryData.likes.map((name) => {
                      return (
                        <li>
                          <a href={"/#/profile/"+name}>{name}</a>
                        </li>
                      )
                    })
                  }
                </ul>
              </div>}
          </div>
        </div>
        }
      </div>
    </div>
  );
}
export default Details;
