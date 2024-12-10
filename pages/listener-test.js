import { useEffect, useState } from 'react';
import ClientUpdate from '../client_update';

const Home = () => {
    const [data_t, setData_t] = useState({}); // 초기값을 빈 객체로 설정
    const [data_e, setData_e] = useState({});
    const serverUrl = 'http://59.187.251.226:54549'; // 서버 URL
    let ui_t, ui_e;

    // 유닉스 타임스탬프를 년, 월, 일, 시, 분, 초로 변환하는 함수
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '데이터 없음'; // 유효하지 않은 경우
        const date = new Date(timestamp * 1000); // 유닉스 타임스탬프는 초 단위이므로 1000 곱함
        return date.toLocaleString('ko-KR', { // 한국어 형식
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    useEffect(() => {
        ui_t = new ClientUpdate(serverUrl);
        ui_e = new ClientUpdate(serverUrl);

        // onSnapshot 사용
        const unsubscribe_t = ui_t.onSnapshot("/toilet/towel", (snapshot_t) => {
            console.log(snapshot_t);
            setData_t(snapshot_t); // 딕셔너리 데이터 설정
        });

        const unsubscribe_e = ui_e.onSnapshot("/indoor/danger", (snapshot) => {
            console.log(snapshot);
            setData_e(snapshot);
        });

        // 컴포넌트 언마운트 시 구독 해지
        return () => {
            unsubscribe_t();
            unsubscribe_e();
        };
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{
                color: '#2c3e50',
                textAlign: 'center',
                fontSize: '2rem',
                borderBottom: '2px solid #3498db',
                paddingBottom: '10px',
                marginBottom: '20px'
            }}>
                수건 잔여량
            </h1>
            <div id="data-container_t" style={{
                backgroundColor: '#ecf0f1',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                marginBottom: '20px'
            }}>
                <p style={{ fontSize: '1.2rem', color: '#34495e' }}>
                    {`수건 잔여량: ${data_t?.num || '데이터 없음'} %`}
                </p>
            </div>
            <h1 style={{
                color: '#2c3e50',
                textAlign: 'center',
                fontSize: '2rem',
                borderBottom: '2px solid #e74c3c',
                paddingBottom: '10px',
                marginBottom: '20px'
            }}>
                위험 상황
            </h1>
            <div id="data-container_e" style={{
                backgroundColor: '#ecf0f1',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <p style={{ fontSize: '1.2rem', color: '#34495e' }}>
                    {`위험 상황 발생 일시: ${formatTimestamp(data_e?.key)}`}
                </p>
            </div>
        </div>
    );
};

export default Home;