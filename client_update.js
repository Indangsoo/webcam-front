import io from "socket.io-client"

class ClientUpdate {
    constructor(serverUrl) {
        this.serverUrl = serverUrl;
        this.socket = io(serverUrl);

        // onSnapshot 콜백을 저장할 맵
        this.listeners = new Map();
    }

    // onSnapshot 유사 메서드 구현
    /**
     * 실시간 업데이트
     * api 주소를 파라미터로 사용
     * 리턴값으로 구독 해지를 위한 함수 반환
     */
    onSnapshot(query, callback) {
        const id = Symbol();
        this.listeners.set(id, callback);

        // 초기 데이터 전달
        this.fetchData(query).then((data) => {
            const dict = JSON.parse(data);

            callback(dict)
        });

        // 실시간 업데이트 수신
        this.socket.on(query, (data) => {
            const dict = JSON.parse(data);

            this.listeners.forEach((listener) => listener(dict));
        });

        // 구독 해지 함수를 반환
        return () => {
            this.listeners.delete(id);
        };
    }

    async fetchData(query) {
        const response = await fetch(`${this.serverUrl}${query}/data`);
        return await response.text();
    }
}

export default ClientUpdate;