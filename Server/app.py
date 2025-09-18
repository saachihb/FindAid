from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import random

app = Flask(__name__)
CORS(app) 

saved_universities = {}

@app.route('/')
def home():
    return "findAid API is running"

@app.route('/colleges', methods=['GET'])
def get_colleges():
    api_url = "https://api.data.gov/ed/collegescorecard/v1/schools"
    api_key = "Vzum4N1M8PdUOyJNsz1XG3QPELQfcIXRNYLgbSKi"

    params = {
        "api_key": api_key,
        "fields": "school.name,school.school_url,school.price_calculator_url,school.city,school.state,school.ownership,school.degrees_awarded.predominant,latest.admissions.admission_rate.overall,latest.student.size,latest.cost.attendance.academic_year,latest.aid.federal_loan_rate,latest.aid.pell_grant_rate,latest.aid.median_debt.completers.overall",
        "per_page": 100,
        "page": 1
    }

    response = requests.get(api_url, params=params)
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch data"}), response.status_code

    colleges = response.json().get('results', [])
    if len(colleges) < 3:
        return jsonify({"error": "Not enough colleges found"}), 500

    random_colleges = random.sample(colleges, 3)

    formatted_colleges = []
    for college in random_colleges:
        formatted_colleges.append({
            "name": college.get("school.name"),
            "school_url": college.get("school.school_url"),
            "price_calculator_url": college.get("school.price_calculator_url"),
            "location": f"{college.get('school.city')}, {college.get('school.state')}",
            "public_private": "Public" if college.get("school.ownership") == 1 else "Private",
            "degree_type": college.get("school.degrees_awarded.predominant"),
            "admission_rate": college.get("latest.admissions.admission_rate.overall"),
            "number_of_undergraduate_students": college.get("latest.student.size"),
            "average_cost_of_attendance": college.get("latest.cost.attendance.academic_year"),
            "average_net_price_pub": college.get("school.price_calculator_url"),
            "percent_of_undergraduates_receiving_federal_loans": college.get("latest.aid.federal_loan_rate"),
            "percent_of_pell_students": college.get("latest.aid.pell_grant_rate"),
            "cumulative_median_student_debt": college.get("latest.aid.median_debt.completers.overall")
        })

    return jsonify(formatted_colleges)

@app.route('/save_college', methods=['POST'])
def save_college():
    data = request.json
    user_id = data.get("user_id")
    college_name = data.get("college_name")

    if not user_id or not college_name:
        return jsonify({"error": "Missing user_id or college_name"}), 400

    saved_universities[user_id] = college_name
    return jsonify({"message": f"Saved {college_name} for user {user_id}"}), 200

@app.route('/saved_college/<user_id>', methods=['GET'])
def get_saved_college(user_id):
    college = saved_universities.get(user_id)
    if not college:
        return jsonify({"error": "No saved college for this user"}), 404

    return jsonify({"saved_college": college})

if __name__ == '__main__':
    app.run(port=8080)
