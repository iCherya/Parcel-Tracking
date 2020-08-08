async function postData(url = "", data = {}) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return await response.json();
}

const requestBody = {
    apiKey: config.NP_KEY,
    modelName: "TrackingDocument",
    calledMethod: "getStatusDocuments",
    methodProperties: {
        Documents: [],
    },
};

if (localStorage.getItem("trackingNumbers")) {
    let trackingData = JSON.parse(localStorage.getItem("trackingNumbers"));

    let valueText = "";
    for (key of trackingData) {
        valueText += key.DocumentNumber + "\n";
    }
    document.querySelector("textarea").value = valueText;
}

document.querySelector("#clear").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector("textarea").value = "";
});

document.querySelector("#track").addEventListener("click", (e) => {
    e.preventDefault();
    const resultBlock = document.querySelector(".result");
    requestBody.methodProperties.Documents = [];
    const textArea = document.querySelector("textarea");
    if (!!textArea.value) {
        e.target.disabled = true;
        e.target.textContent = "Tracking";

        const trackingArr = textArea.value.match(/\w+/gi) || [];
        textArea.value = "";

        let textAreaOutput = trackingArr.reduce((prev, curr) => {
            return prev + "\n" + curr;
        });
        textArea.value = textAreaOutput;

        trackingArr.forEach((el) => {
            requestBody.methodProperties.Documents.push({
                DocumentNumber: el,
            });
        });
        localStorage.setItem("trackingNumbers", JSON.stringify(requestBody.methodProperties.Documents));

        postData("https://api.novaposhta.ua/v2.0/json/", requestBody).then((data) => {
            resultBlock.innerHTML = showStatus(data);
            e.target.disabled = false;
            e.target.textContent = "Track again";
        });
    }
});

function showStatus(resultData) {
    return resultData.data.reduce((prev, curr) => {
        return prev + `<b>${curr.Number}</b>: ${curr.Status}<br>`;
    }, " ");
}
