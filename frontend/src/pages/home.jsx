import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const [meetingLink, setMeetingLink] = useState("");

    const { addToUserHistory } = useContext(AuthContext);

    // Function to generate a random meeting code
    const generateMeetingCode = () => {
        const code = Math.random().toString(36).substring(2, 12); // Generate a random string
        setMeetingCode(code);
    };

    const handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode);
        const link = `${window.location.origin}/${meetingCode}`;
        setMeetingLink(link);
        navigate(`/${meetingCode}`);
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(meetingLink);
        alert('Meeting link copied to clipboard!');
    };

    return (
        <>
            <div className="navBar">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <h2>MeetPulse</h2>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => navigate("/history")}>
                        <RestoreIcon />
                    </IconButton>
                    <p>History</p>
                    <Button onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/auth");
                    }}>
                        Logout
                    </Button>
                </div>
            </div>

            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Providing Quality Video Call Just Like Quality Code</h2>
                        <div style={{ display: 'flex', gap: "10px" }}>
                            <TextField
                                onChange={e => setMeetingCode(e.target.value)}
                                value={meetingCode} // Control input value
                                id="outlined-basic"
                                label="Meeting Code"
                                variant="outlined"
                                placeholder="Enter or generate a code" // Set placeholder text
                                style={{ marginBottom: '10px' }} // Ensure there's space below the input
                            />
                            <Button onClick={generateMeetingCode} variant='contained'>
                                Generate Meeting Code
                            </Button>
                            <Button onClick={handleJoinVideoCall} variant='contained'>
                                Join
                            </Button>
                        </div>
                        {meetingLink && (
                            <div style={{ marginTop: '20px' }}>
                                <p>Meeting Link: {meetingLink}</p>
                                <IconButton onClick={handleCopyToClipboard}>
                                    <ContentCopyOutlinedIcon />
                                </IconButton>
                            </div>
                        )}
                    </div>
                </div>
                <div className='rightPanel'>
                    <img srcSet='/logo3.png' alt="" />
                </div>
            </div>
        </>
    );
}

export default withAuth(HomeComponent);
