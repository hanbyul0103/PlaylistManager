// 라이브러리
import axios from "axios";

async function getFloTrackInfo(genre) {
    const url = `https://www.music-flo.com/api/display/v1/browser/chart/${genre}/track/list?size=100`;

    try {
        const response = await axios.get(url, {
            params: {
                page: 1,
                size: 10,
            },
        });

        const trackList = response.data?.data?.trackList || [];

        return { data: trackList, chartId: genre };

    } catch (error) {
        return { data: error.message };
    }
}

export { getFloTrackInfo }