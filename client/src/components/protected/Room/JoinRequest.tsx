import axios from "axios";
import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "react-router-dom";
import { toasty } from "../../../utils/toasty.util";

/* ---------------- TYPES ---------------- */

type RequestPeople = {
    _id: string;
    name: string;
    userId: string;
};

type ParticipantPeople = {
    joinRequestId: string;
    userId: string;
    name: string;
    isHost: string;
    mic: boolean;
    camera: boolean;
    participantId: string;
};

type JoinRequestProps = {
    joinRequests: RequestPeople[];
    acceptedRequest?: ParticipantPeople;
};

const LIMIT = 20;

/* ---------------- COMPONENT ---------------- */

const JoinRequest: React.FC<JoinRequestProps> = ({
    joinRequests,
    acceptedRequest,
}) => {
    const { token } = useParams<{ token: string }>();

    const [requests, setRequests] = useState<RequestPeople[]>([]);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    /* ---------------- FETCH ---------------- */

    const fetchRequests = async (isScroll = false) => {
        if (!token || loading) return;

        setLoading(true);

        try {
            const currentSkip = isScroll ? skip : 0;

            const { data } = await axios.get('/api/room/join-request', {
                params: { skip: currentSkip, limit: LIMIT },
            });

            setRequests(prev =>
                isScroll ? [...prev, ...data] : data
            );

            setSkip(currentSkip + LIMIT);
            setHasMore(data.length === LIMIT);
        } catch {
            toasty.error("Failed to load join requests");
        } finally {
            setLoading(false);
        }
    }

    /* ---------------- INITIAL LOAD ---------------- */

    useEffect(() => {
        fetchRequests(false);
    }, []);

    /* ---------------- REAL-TIME JOIN REQUESTS ---------------- */

    useEffect(() => {
        console.log("joinRequests: ", joinRequests);
        if (!joinRequests.length) return;

        setRequests(prev => {
            const existingIds = new Set(prev.map(r => r._id));
            const newOnes = joinRequests.filter(
                r => !existingIds.has(r._id)
            );
            return [...newOnes, ...prev];
        });
    }, [joinRequests]);

    /* ---------------- ACCEPTED REQUEST REMOVE ---------------- */

    useEffect(() => {
        if (!acceptedRequest?.joinRequestId) return;

        setRequests(prev =>
            prev.filter(
                r => r._id !== acceptedRequest.joinRequestId
            )
        );
    }, [acceptedRequest]);


    /* ---------------- ACTIONS ---------------- */

    const acceptRequest = async (people: RequestPeople) => {
        try {
            await axios.post(`/api/room/accept`, {
                userId: people.userId,
                joinRequestId: people._id,
            });

            setRequests(prev =>
                prev.filter(r => r._id !== people._id)
            );
        } catch {
            toasty.error("Failed to accept request");
        }
    };

    const rejectRequest = async (people: RequestPeople) => {
        try {
            await axios.post(`/api/room/reject`, {
                userId: people.userId,
                joinRequestId: people._id,
            });

            setRequests(prev =>
                prev.filter(r => r._id !== people._id)
            );
        } catch {
            toasty.error("Failed to reject request");
        }
    };

    /* ---------------- UI STATES ---------------- */

    if (loading && requests.length === 0) {
        return <p>Loading join requests...</p>;
    }

    if (!loading && requests.length === 0) {
        return <p>No join requests</p>;
    }

    /* ---------------- RENDER ---------------- */

    return (
        <div className="people-list">
            <div className="people-section-header">
                <h3 className="people-section-title">Join Requests</h3>
            </div>

            <InfiniteScroll
                dataLength={requests.length}
                next={() => fetchRequests(true)}
                hasMore={hasMore}
                loader={<p>Loading more...</p>}
            >
                {requests.map((req, i) => (
                    <div key={`${req._id}-${i}`} className="people-item">
                        <div className="people-item-left">
                            <div className="people-avatar">
                                {req.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="people-meta">
                                <div className="people-name">
                                    {req.name}
                                </div>
                                <span className="people-role">
                                    Request
                                </span>
                            </div>
                        </div>

                        <div className="people-actions">
                            <button
                                className="btn-accept"
                                onClick={() => acceptRequest(req)}
                            >
                                Accept
                            </button>

                            <button
                                className="btn-reject"
                                onClick={() => rejectRequest(req)}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                ))}
            </InfiniteScroll>
        </div>
    );
};

export default JoinRequest;