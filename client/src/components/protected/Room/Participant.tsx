import axios, { AxiosError } from "axios";
import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "react-router-dom";
import { toasty } from "../../../utils/toasty.util";
import { TOAST_MESSAGE } from "../../../constants/message.constant";

/* ---------------- TYPES ---------------- */
type ParticipantPeople = {
    userId: string;
    name: string;
    isHost: boolean;
    mic: boolean;
    camera: boolean;
    _id: string;
};

type ParticipantLeavePayload = {
    token: string;
    name: string;
    participantId: string;
}

type ParticipantProp = {
    leavedParticipant: ParticipantLeavePayload | undefined
}

/* ---------------- COMPONENT ---------------- */

const Participant: React.FC<ParticipantProp> = ({
    leavedParticipant
}) => {

    const { token } = useParams<{ token: string }>();

    const scrollRef = useRef<HTMLDivElement | null>(null);

    const [participants, setParticipants] = useState<ParticipantPeople[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);
    const [loading, setLoading] = useState(false);

    const limit = 20;

    /* ---------------- FETCH PARTICIPANTS ---------------- */

    const fetchParticipants = useCallback(
        async (isScroll: boolean) => {
            if (!token || loading) return;

            setLoading(true);

            try {
                const currentSkip = isScroll ? skip : 0;

                const { data } = await axios.get(`/api/room/participants`, {
                    params: {
                        skip: currentSkip,
                        limit,
                    },
                });

                if (isScroll) {
                    setParticipants(prev => [...prev, ...data]);
                    setSkip(prev => prev + limit);
                } else {
                    setParticipants(data);
                    setSkip(limit);
                }

                setHasMore(data.length === limit);
            } catch (error) {
                const err = error as AxiosError<{ message?: string }>;
                toasty.error(
                    err?.response?.data?.message || TOAST_MESSAGE.ERROR
                );
            } finally {
                setLoading(false);
            }
        },
        [token, skip, loading]
    );

    /* ---------------- INITIAL LOAD ---------------- */

    useEffect(() => {
        if (!token) return;

        setParticipants([]);
        setSkip(0);
        setHasMore(true);
        fetchParticipants(false);
    }, [token]);

    /* ---------------- UI STATES ---------------- */

    useEffect(() => {
        if (!leavedParticipant) {
            return;
        }
        setParticipants(prev => prev.filter(participant => participant._id != leavedParticipant.participantId))
    }, [leavedParticipant])

    if (loading && participants.length === 0) {
        return <p>Loading participants...</p>;
    }

    if (!loading && participants.length === 0) {
        return <p>No participants found</p>;
    }

    /* ---------------- RENDER ---------------- */

    return (
        <div
            ref={scrollRef}
            id="people-scroll"
            className="people-list"
        >
            <div className="people-section-header">
                <h3 className="people-section-title">Participants</h3>
            </div>
            <InfiniteScroll
                dataLength={participants.length}
                next={() => fetchParticipants(true)}
                hasMore={hasMore}
                loader={<p>Loading more...</p>}
                scrollableTarget="people-scroll"
            >
                {participants.map((p, i) => (
                    <div key={`${p.userId}-${i}`} className="people-item">
                        <div className="people-item-left">
                            <div className="people-avatar">
                                {p.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="people-meta">
                                <div className="people-name">
                                    {p.name}
                                </div>
                                {p.isHost && (
                                    <span className="people-role">
                                        Host
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="people-status">
                            <i
                                className={`bi ${p.mic
                                    ? "bi-mic-fill mic-on"
                                    : "bi-mic-mute-fill mic-off"
                                    }`}
                            />
                            <i
                                className={`bi ${p.camera
                                    ? "bi-camera-video-fill cam-on"
                                    : "bi-camera-video-off-fill cam-off"
                                    }`}
                            />
                        </div>
                    </div>
                ))}
            </InfiniteScroll>
        </div>
    );
};

export default Participant;