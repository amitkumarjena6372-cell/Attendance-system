let subjects = JSON.parse(localStorage.getItem('attendanceData')) || [];

function save() {
    localStorage.setItem('attendanceData', JSON.stringify(subjects));
    render();
}

function addSubject() {
    const input = document.getElementById('subjectInput');
    if (!input.value.trim()) return;
    
    subjects.push({
        name: input.value,
        present: 0,
        total: 0,
        lastUpdated: 'No classes marked' // Fixed 'undefined' issue
    });
    
    input.value = "";
    save();
}

function markAttendance(index, isPresent) {
    subjects[index].total += 1;
    if (isPresent) subjects[index].present += 1;
    
    const now = new Date();
    subjects[index].lastUpdated = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    save();
}

function deleteSubject(index) {
    if(confirm("Delete this subject?")) {
        subjects.splice(index, 1);
        save();
    }
}

function exportToExcel() {
    if (subjects.length === 0) return alert("No data!");
    const excelData = subjects.map(s => ({
        "Subject": s.name, "Present": s.present, "Total": s.total,
        "Percentage": s.total === 0 ? "0%" : Math.round((s.present / s.total) * 100) + "%",
        "Last Marked": s.lastUpdated
    }));
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "MyAttendance.xlsx");
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(subjects));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", "attendance_backup.json");
    dl.click();
}

function importData(event) {
    const reader = new FileReader();
    reader.onload = (e) => { subjects = JSON.parse(e.target.result); save(); };
    reader.readAsText(event.target.files[0]);
}

function render() {
    const list = document.getElementById('subjectList');
    list.innerHTML = "";

    subjects.forEach((sub, index) => {
        const percent = sub.total === 0 ? 0 : Math.round((sub.present / sub.total) * 100);
        list.innerHTML += `
            <div class="card">
                <div class="subject-header">
                    <h3>${sub.name}</h3>
                    <button class="delete-btn" onclick="deleteSubject(${index})">&times;</button>
                </div>
                <div class="stats-row">
                    <span>Present: <b>${sub.present}</b> / Total: <b>${sub.total}</b></span>
                    <span class="percentage">${percent}%</span>
                </div>
                <div class="actions">
                    <button class="btn-present" onclick="markAttendance(${index}, true)">Present</button>
                    <button class="btn-absent" onclick="markAttendance(${index}, false)">Absent</button>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percent}%; background: ${percent < 75 ? '#e74c3c' : '#2ecc71'}"></div>
                </div>
                <div class="last-updated">Last marked: ${sub.lastUpdated}</div>
            </div>`;
    });
}
render();