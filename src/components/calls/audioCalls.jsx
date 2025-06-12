import React, { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'peerjs';

// Ensure Bootstrap CSS is imported in your main application file (e.g., src/index.js or src/App.js)
// import 'bootstrap/dist/css/bootstrap.min.css';

// Define your brand colors for a sleek Jikoni look
const colors = {
    primary: '#FF4532',     // Jikoni Red
    secondary: '#00C853',   // Jikoni Green
    darkText: '#1A202C',    // Dark text for headings
    lightBackground: '#F0F2F5', // Light background for the page
    cardBackground: '#FFFFFF',  // White for the form card
    borderColor: '#D1D9E6',  // Light border for inputs
    errorText: '#EF4444',    // Red for errors
    placeholderText: '#A0ECB0', // Muted text for placeholders (changed to a lighter green)
    buttonHover: '#E6392B',  // Darker red on button hover
    disabledButton: '#CBD5E1', // Gray for disabled buttons
    successBackground: '#E6FFF0', // Light green for success alerts
    errorBackground: '#FFF0F0',   // Light red for error alerts
};

// Define simple SVG icons directly for self-contained code.
// In a production app with Bootstrap, consider using Bootstrap Icons (npm i bootstrap-icons)
// or Font Awesome for a more integrated icon solution.
const PhoneCall = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
);

const PhoneOff = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.68 13.31a16 16 0 0 0 3.41 3.41L16 19l4 4 1-1-9-9-4-4z"/>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        <line x1="2" y1="2" x2="22" y2="22"/>
    </svg>
);

const Mic = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
);

const MicOff = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="2" y1="2" x2="22" y2="22"/>
        <path d="M9.9 9.9V5a3 3 0 0 1 6 0v2"/>
        <path d="M16 10v2a7 7 0 0 1-13.38 2.81"/>
        <line x1="12" y1="19" x2="12" y2="22"/>
        <path d="M19 10v2a7 7 0 0 1-1.23 4.2"/>
    </svg>
);

const Volume2 = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
);

const VolumeX = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <line x1="22" y1="9" x2="16" y2="15"/>
        <line x1="16" y1="9" x2="22" y2="15"/>
    </svg>
);

// The AudioCall component, now accepting 'riderId' and 'chefId' props
const AudioCall = ({ riderId, chefId }) => {
    // State variables for managing call status and UI
    const [myId, setMyId] = useState(''); // Rider's Peer ID
    const [remoteId, setRemoteId] = useState(''); // Chef's Peer ID
    const [callStatus, setCallStatus] = useState('idle'); // 'idle', 'connecting', 'ringing', 'in-call', 'ended', 'error'
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true); // Represents loudspeaker mode
    const [localStream, setLocalStream] = useState(null);
    const [incomingCallData, setIncomingCallData] = useState(null); // { call, fromPeerId }
    const [message, setMessage] = useState(''); // General message display

    // Refs for PeerJS instance, current call, and audio elements
    const peerRef = useRef(null);
    const currentCallRef = useRef(null);
    const remoteAudioRef = useRef(null); // Ref for the audio element playing remote stream

    /**
     * Cleans up the current call and resets states.
     * @param {string} statusMessage - Message to display upon ending the call.
     */
    const cleanupCall = useCallback((statusMessage = 'Call ended.') => {
        // Stop local stream tracks
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        // Disconnect remote audio source
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
        }
        // Close PeerJS call
        if (currentCallRef.current) {
            currentCallRef.current.close();
            currentCallRef.current = null;
        }

        setCallStatus('ended');
        setMessage(statusMessage);
        setIsMuted(false); // Reset mute state
        setIsSpeakerOn(true); // Reset speaker state
        setIncomingCallData(null); // Clear incoming call data
    }, [localStream]);

    /**
     * Initializes PeerJS and sets up event listeners.
     * It also manages the rider's ID in local storage.
     */
    useEffect(() => {
        // Prevent re-initialization if PeerJS is already set up
        if (peerRef.current) return;

        setMessage('Initializing secure connection...');
        try {
            // Use the riderId prop as the PeerJS ID if provided, otherwise let PeerJS generate one.
            const initialPeerId = riderId || localStorage.getItem('jikoniRiderPeerId') || undefined;

            // Initialize PeerJS with your server configuration
            // IMPORTANT: Replace 'localhost' and other values with your actual PeerJS server details.
            const peer = new Peer(initialPeerId, {
                host: 'localhost',           // Example: 'your-peerjs-server.com'
                port: 9000,                  // Default PeerJS server port
                path: '/jikoni-call',        // Path configured on your PeerJS server
                debug: 2,                    // Log PeerJS events for debugging (0 for production)
                config: {
                    'iceServers': [
                        { urls: 'stun:stun.l.google.com:19302' }, // Google STUN server for NAT traversal
                    ]
                }
            });

            // Event: PeerJS connection opened
            peer.on('open', id => {
                setMyId(id);
                setCallStatus('idle');
                setMessage(`Ready! Your Rider ID: ${id}`);
                console.log('My Peer ID:', id);

                // Save the Peer ID to local storage only if it was newly generated or updated
                if (!localStorage.getItem('jikoniRiderPeerId') || localStorage.getItem('jikoniRiderPeerId') !== id) {
                    localStorage.setItem('jikoniRiderPeerId', id);
                    console.log('Peer ID saved to localStorage:', id);
                }
            });

            // Event: Incoming call
            peer.on('call', call => {
                console.log('Incoming call from:', call.peer);
                // Only accept incoming calls if we are idle or ended.
                if (callStatus === 'idle' || callStatus === 'ended') {
                    setIncomingCallData({ call, fromPeerId: call.peer });
                    setCallStatus('ringing');
                    setMessage(`Incoming call from Chef ${call.peer.substring(0, 8)}...`); // Truncate ID for display
                } else {
                    console.log(`Rejecting incoming call from ${call.peer} as current status is ${callStatus}`);
                    call.close();
                }
            });

            // Event: PeerJS error
            peer.on('error', err => {
                console.error('PeerJS Error:', err);
                setMessage(`Connection Error: ${err.message}. Please check your network and server setup.`);
                setCallStatus('error');
                cleanupCall();
            });

            // Store the peer instance in ref
            peerRef.current = peer;

            // Cleanup function when component unmounts
            return () => {
                if (peerRef.current) {
                    peerRef.current.destroy();
                    peerRef.current = null;
                    console.log('PeerJS instance destroyed.');
                }
                cleanupCall();
            };
        } catch (error) {
            console.error('Failed to initialize PeerJS:', error);
            setMessage(`Failed to connect: ${error.message}`);
            setCallStatus('error');
        }
    }, [cleanupCall, riderId]); // Added riderId as a dependency here to allow initial peer setup with it

    // Effect to update remoteId if chefId prop changes (e.g., rider selects a new order)
    useEffect(() => {
        if (chefId) {
            setRemoteId(chefId);
            setMessage(`Chef ID for current order: ${chefId.substring(0, 8)}...`);
        } else {
            setRemoteId(''); // Clear remote ID if no chefId is provided
            setMessage('Enter Chef ID or select an order to call.');
        }
    }, [chefId]);

    /**
     * Handles stream events for both caller and answerer.
     * Plays the remote audio stream.
     * @param {MediaStream} stream - The remote audio stream.
     */
    const handleStream = (stream) => {
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = stream;
            // Ensure audio plays automatically once metadata is loaded
            remoteAudioRef.current.onloadedmetadata = () => {
                remoteAudioRef.current.play().catch(e => console.error("Audio play failed:", e));
            };
        }
        setCallStatus('in-call');
        setMessage(`Connected with Chef ${currentCallRef.current?.peer.substring(0, 8)}`);
        console.log('Remote stream received.');
    };

    /**
     * Starts an outgoing call to a remote peer (chef).
     */
    const startCall = async () => {
        if (!peerRef.current || !myId) {
            setMessage('App not ready. Please wait for PeerJS to initialize.');
            return;
        }
        if (!remoteId) {
            setMessage('Please enter or confirm the Chef\'s ID to call.');
            return;
        }
        if (remoteId === myId) {
            setMessage('Cannot call yourself. This is for contacting chefs!');
            return;
        }

        setCallStatus('connecting');
        setMessage(`Dialing Chef ${remoteId.substring(0, 8)}...`);

        try {
            // Request local audio stream (microphone access)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setLocalStream(stream); // Store local stream for muting/unmuting

            // Create outgoing call
            const call = peerRef.current.call(remoteId, stream);
            currentCallRef.current = call;

            // Event: Remote stream received
            call.on('stream', handleStream);

            // Event: Call closed by remote peer or error
            call.on('close', () => cleanupCall('Call ended.'));
            call.on('error', (err) => {
                console.error('Call Error:', err);
                cleanupCall(`Call failed: ${err.message}`);
            });

            console.log('Call initiated to:', remoteId);
        } catch (error) {
            console.error('Failed to get local stream or initiate call:', error);
            setMessage(`Microphone access needed to make calls. Please allow access and try again.`);
            setCallStatus('error');
            cleanupCall();
        }
    };

    /**
     * Answers an incoming call.
     */
    const answerCall = async () => {
        if (!incomingCallData) return; // No incoming call to answer

        setCallStatus('connecting');
        setMessage(`Answering call from Chef ${incomingCallData.fromPeerId.substring(0, 8)}...`);

        try {
            // Request local audio stream (microphone access)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setLocalStream(stream); // Store local stream for muting/unmuting

            // Answer the incoming call with our local stream
            incomingCallData.call.answer(stream);
            currentCallRef.current = incomingCallData.call; // Set as current active call

            // Event: Remote stream received
            incomingCallData.call.on('stream', handleStream);

            // Event: Call closed by remote peer or error
            incomingCallData.call.on('close', () => cleanupCall('Call ended by Chef.'));
            incomingCallData.call.on('error', (err) => {
                console.error('Call Error:', err);
                cleanupCall(`Call error: ${err.message}`);
            });

            setIncomingCallData(null); // Clear incoming call data once answered
            console.log('Call answered.');
        } catch (error) {
            console.error('Failed to get local stream or answer call:', error);
            setMessage(`Microphone access needed to answer calls. Please allow access and try again.`);
            setCallStatus('error');
            cleanupCall();
        }
    };

    /**
     * Rejects or cancels an incoming call or an outgoing call attempt.
     */
    const rejectCall = () => {
        if (incomingCallData) {
            // For an incoming call, we just clear our state; the caller will eventually timeout
            setMessage(`Call from Chef ${incomingCallData.fromPeerId.substring(0, 8)} rejected.`);
            incomingCallData.call.close(); // Explicitly close the incoming call
            setIncomingCallData(null);
            setCallStatus('idle'); // Back to idle after rejecting
        } else if (callStatus === 'connecting' && currentCallRef.current) {
            // If we are dialing out and user clicks reject, clean up the outgoing call
            cleanupCall('Call cancelled.');
        }
    };

    /**
     * Ends the current active call.
     */
    const endCall = () => {
        cleanupCall('Call ended.');
        console.log('Call ended by user.');
    };

    /**
     * Toggles the mute status of the local microphone.
     * Disables/enables the first audio track of the local media stream.
     */
    const toggleMute = () => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                const newState = !isMuted;
                audioTracks[0].enabled = !newState; // Toggle track enabled state
                setIsMuted(newState);
                setMessage(newState ? 'Microphone Muted.' : 'Microphone Unmuted.');
            } else {
                setMessage('No microphone detected in active stream.');
            }
        } else {
            setMessage('No active call to mute/unmute.');
        }
    };

    /**
     * Toggles the conceptual "speaker" mode (loudspeaker vs. normal).
     */
    const toggleSpeaker = () => {
        const newState = !isSpeakerOn;
        setIsSpeakerOn(newState);
        setMessage(newState ? 'Loudspeaker ON.' : 'Loudspeaker OFF (using default output).');
    };

    return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 p-3" style={{ backgroundColor: colors.lightBackground }}>
            <div className="card shadow-lg p-4 w-100 position-relative" style={{ maxWidth: '480px', borderRadius: '1.5rem', backgroundColor: colors.cardBackground, border: `1px solid ${colors.borderColor}`, overflow: 'hidden' }}>

                {/* Jikoni Express Title */}
                <h2 className="card-title text-center mb-4 pt-2" style={{ color: colors.darkText, fontSize: '2.2rem', fontWeight: 'bold', letterSpacing: '-0.05rem' }}>
                    <PhoneCall style={{ color: colors.primary, fontSize: '2.5rem', verticalAlign: 'middle', marginRight: '10px' }} />
                    Jikoni Direct Call
                </h2>
                <p className="text-center text-muted mb-4" style={{ fontSize: '0.95rem' }}>
                    Connect instantly with your Chef for order updates.
                </p>

                {/* Message Display */}
                {message && (
                    <div className={`alert text-center fw-medium py-2 px-3 ${callStatus === 'error' ? 'alert-danger-custom' : 'alert-success-custom'}`}
                         role="alert"
                         style={{
                             borderRadius: '0.75rem',
                             fontWeight: '500',
                             marginBottom: '1.5rem',
                             animation: (callStatus === 'ringing' || callStatus === 'connecting') ? 'pulse-effect 1.5s infinite' : 'none'
                         }}>
                        {message}
                    </div>
                )}

                {/* Your ID Section */}
                <div className="mb-4 text-center">
                    <label htmlFor="myIdDisplay" className="form-label text-muted mb-1" style={{ fontSize: '0.85rem' }}>Your Rider ID:</label>
                    <div id="myIdDisplay" className="input-group">
                        <input
                            type="text"
                            className="form-control text-center fw-bold"
                            value={myId || 'Connecting...'}
                            readOnly
                            style={{
                                borderColor: colors.borderColor,
                                borderRadius: '0.75rem 0 0 0.75rem',
                                color: colors.darkText,
                                fontSize: '1rem',
                                backgroundColor: `${colors.lightBackground}`,
                            }}
                        />
                        {myId && (
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    const tempInput = document.createElement('textarea');
                                    tempInput.value = myId;
                                    document.body.appendChild(tempInput);
                                    tempInput.select();
                                    document.execCommand('copy');
                                    document.body.removeChild(tempInput);
                                    setMessage('Rider ID copied to clipboard!');
                                }}
                                style={{ borderTopRightRadius: '0.75rem', borderBottomRightRadius: '0.75rem', borderColor: colors.borderColor, color: colors.darkText }}
                                title="Copy ID"
                            >
                                📋
                            </button>
                        )}
                    </div>
                </div>

                {/* Call Input & Button (Initial State) */}
                {(callStatus === 'idle' || callStatus === 'ended' || callStatus === 'error') && (
                    <div className="d-grid gap-3 mb-4">
                        <div className="form-floating">
                            <input
                                type="text"
                                className="form-control"
                                id="chefIdInput"
                                placeholder=" "
                                value={remoteId}
                                onChange={(e) => setRemoteId(e.target.value)}
                                style={{ borderColor: colors.borderColor, borderRadius: '0.75rem', color: colors.darkText, height: '3.5rem' }}
                                disabled={callStatus === 'connecting'}
                            />
                            <label htmlFor="chefIdInput" style={{ color: colors.placeholderText }}>Chef's ID (from order)</label>
                        </div>
                        <button
                            onClick={startCall}
                            className="btn btn-lg d-flex align-items-center justify-content-center gap-2 text-uppercase fw-bold shadow-sm call-btn"
                            style={{
                                backgroundColor: colors.primary,
                                color: colors.cardBackground,
                                borderRadius: '0.75rem',
                                padding: '0.9rem 1.5rem',
                                opacity: (!remoteId || callStatus === 'connecting') ? '0.7' : '1',
                                cursor: (!remoteId || callStatus === 'connecting') ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.3s ease, transform 0.2s ease',
                            }}
                            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = colors.buttonHover; }}
                            onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = colors.primary; }}
                            disabled={!remoteId || callStatus === 'connecting'}
                        >
                            <PhoneCall size={22} /> {callStatus === 'connecting' ? 'Calling...' : 'Call Chef'}
                        </button>
                    </div>
                )}

                {/* Incoming Call UI (Ringing State) */}
                {callStatus === 'ringing' && incomingCallData && (
                    <div className="card p-4 mb-4 text-center border-0 shadow-sm incoming-call-card" style={{ backgroundColor: colors.successBackground, borderRadius: '1rem', animation: 'pulse-effect 1.5s infinite' }}>
                        <PhoneCall style={{ color: colors.primary, fontSize: '3.5rem', marginBottom: '1rem' }} />
                        <p className="card-text mb-3" style={{ fontSize: '1.4rem', fontWeight: 'bold', color: colors.darkText }}>
                            Incoming Call from <br/> <span className="break-all" style={{ color: colors.primary }}>{incomingCallData.fromPeerId.substring(0, 8)}...</span>
                        </p>
                        <div className="d-flex justify-content-center gap-3 mt-3">
                            <button
                                onClick={answerCall}
                                className="btn btn-success btn-lg d-flex align-items-center justify-content-center gap-2 text-uppercase fw-bold flex-grow-1 shadow-sm action-btn"
                                style={{ backgroundColor: colors.secondary, borderColor: colors.secondary, color: colors.cardBackground, borderRadius: '0.75rem', transition: 'background-color 0.3s ease', padding: '0.8rem 1.2rem' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00B050'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.secondary}
                            >
                                <PhoneCall size={20} /> Answer
                            </button>
                            <button
                                onClick={rejectCall}
                                className="btn btn-danger btn-lg d-flex align-items-center justify-content-center gap-2 text-uppercase fw-bold flex-grow-1 shadow-sm action-btn"
                                style={{ backgroundColor: colors.errorText, borderColor: colors.errorText, color: colors.cardBackground, borderRadius: '0.75rem', transition: 'background-color 0.3s ease', padding: '0.8rem 1.2rem' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DC3545'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.errorText}
                            >
                                <PhoneOff size={20} /> Reject
                            </button>
                        </div>
                    </div>
                )}

                {/* In-Call Controls (Active Call State) */}
                {callStatus === 'in-call' && (
                    <div className="d-flex flex-column align-items-center justify-content-center mt-4">
                        <h3 className="mb-4 text-center" style={{ fontSize: '1.6rem', fontWeight: 'bold', color: colors.darkText }}>
                            Connected with <span style={{ color: colors.primary }}>Chef {currentCallRef.current?.peer.substring(0, 8)}...</span>
                        </h3>
                        <div className="d-flex justify-content-center gap-4 mb-4">
                            {/* Mute/Unmute Button */}
                            <button
                                onClick={toggleMute}
                                className="btn icon-btn rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                style={{
                                    backgroundColor: isMuted ? colors.disabledButton : colors.secondary,
                                    borderColor: isMuted ? colors.disabledButton : colors.secondary,
                                    color: colors.cardBackground,
                                    width: '70px', height: '70px',
                                    fontSize: '1rem',
                                    transition: 'background-color 0.3s ease, transform 0.2s ease',
                                }}
                                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isMuted ? colors.disabledButton : '#00B050'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isMuted ? colors.disabledButton : colors.secondary}
                            >
                                {isMuted ? <MicOff size={32} /> : <Mic size={32} />}
                            </button>

                            {/* Speaker Toggle Button */}
                            <button
                                onClick={toggleSpeaker}
                                className="btn icon-btn rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                style={{
                                    backgroundColor: isSpeakerOn ? colors.secondary : colors.disabledButton,
                                    borderColor: isSpeakerOn ? colors.secondary : colors.disabledButton,
                                    color: colors.cardBackground,
                                    width: '70px', height: '70px',
                                    fontSize: '1rem',
                                    transition: 'background-color 0.3s ease, transform 0.2s ease',
                                }}
                                title={isSpeakerOn ? 'Turn Off Loudspeaker' : 'Turn On Loudspeaker'}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isSpeakerOn ? '#00B050' : colors.disabledButton}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isSpeakerOn ? colors.secondary : colors.disabledButton}
                            >
                                {isSpeakerOn ? <Volume2 size={32} /> : <VolumeX size={32} />}
                            </button>

                            {/* End Call Button */}
                            <button
                                onClick={endCall}
                                className="btn btn-danger icon-btn rounded-circle d-flex align-items-center justify-content-center shadow-lg"
                                style={{
                                    backgroundColor: colors.primary,
                                    borderColor: colors.primary,
                                    color: colors.cardBackground,
                                    width: '80px', height: '80px',
                                    fontSize: '1.2rem',
                                    transition: 'background-color 0.3s ease, transform 0.2s ease',
                                }}
                                title="End Call"
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.buttonHover}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
                            >
                                <PhoneOff size={38} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Hidden Audio Element for Remote Stream */}
                <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }}></audio>

                {/* Note about PeerJS Server */}
                <div className="text-muted mt-4 text-center border-top pt-3" style={{ fontSize: '0.75rem', borderColor: colors.borderColor }}>
                    <p className="mb-0">
                        *Powered by Jikoni Secure Connect. Ensures direct communication.
                    </p>
                </div>
            </div>

            {/* Custom CSS for enhanced aesthetics and animations */}
            <style>{`
                body {
                    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                .card {
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
                }
                .form-control:focus {
                    border-color: ${colors.primary} !important;
                    box-shadow: 0 0 0 0.25rem ${colors.primary}40 !important;
                }
                .btn {
                    border-width: 0px !important; /* Remove default Bootstrap button borders */
                }
                .btn:active, .btn:focus {
                    box-shadow: none !important; /* Remove active/focus outline */
                }
                .call-btn:hover, .action-btn:hover {
                    transform: translateY(-2px); /* Lift button slightly on hover */
                }
                .icon-btn:hover {
                    transform: scale(1.05); /* Slight scale for circular buttons */
                }

                /* Custom Alert Styles */
                .alert-success-custom {
                    background-color: ${colors.successBackground};
                    color: ${colors.secondary};
                    border: 1px solid ${colors.secondary}66;
                }
                .alert-danger-custom {
                    background-color: ${colors.errorBackground};
                    color: ${colors.errorText};
                    border: 1px solid ${colors.errorText}66;
                }

                /* Keyframe Animations */
                @keyframes pulse-effect {
                    0% { box-shadow: 0 0 0 0 ${colors.primary}40; }
                    70% { box-shadow: 0 0 0 20px rgba(255, 69, 50, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 69, 50, 0); }
                }
                .incoming-call-card {
                    animation: pulse-effect 1.5s infinite;
                    border: 1px solid ${colors.primary}66 !important;
                }
                .break-all {
                    word-break: break-all;
                }
            `}</style>
        </div>
    );
};

export default AudioCall;