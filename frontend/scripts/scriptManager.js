const sectionOneToggler = document.getElementById('sectionOneToggler');
const sectionTwoToggler = document.getElementById('sectionTwoToggler');
const sectionThreeToggler = document.getElementById('sectionThreeToggler');
const emptyBody = document.getElementById('emptyBody')
sectionOneToggler.addEventListener("click", () => {
    document.getElementById('documentGenerrator').classList.remove("removed");
    document.getElementById('estimateCalculator').classList.add("removed");
    emptyBody.remove();
    sectionTwoToggler.classList.remove("active");
    sectionThreeToggler.classList.remove("active");
    sectionOneToggler.classList.add("active");
})
sectionTwoToggler.addEventListener("click", async () => {
    let user_name = prompt("Enter User Name");
    if (!user_name) return;
    let passkey = prompt("Enter Password");
    if (!passkey) return;
    try {
        if (!user_name || !passkey) return;
        let response = await fetch(`/login?user_name=${user_name}&passkey=${passkey}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        let fetchedDetails = await response.json();
        if (fetchedDetails.length > 0) {
            document.getElementById('documentGenerrator').classList.add("removed");
            document.getElementById('estimateCalculator').classList.remove("removed");
            emptyBody.remove();
            sectionOneToggler.classList.remove("active");
            sectionThreeToggler.classList.remove("active");
            sectionTwoToggler.classList.add("active");
            resetEstimator();
            return;
        } else {
            alert("Invalid Credentials");
        }
    } catch (err) {
        console.error(err);
        return;
    }
})
sectionThreeToggler.addEventListener("click", () => {
    alert("In Progress");
})