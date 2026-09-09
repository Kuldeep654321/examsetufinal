import { Exam, Opportunity } from '@/types';

export interface StudentProfileContext {
  classLevel: string; // '10', '12', 'Polytechnic', 'BTech_Final', 'BTech_PreFinal', 'Graduate', 'Postgraduate'
  stream: string; // 'PCM', 'PCB', 'Commerce', 'Arts/Humanities', 'Engineering', 'Any'
  targetCategory?: string;
}

/**
 * Maps a student's current academic level & stream to eligible/recommended exams
 */
export function filterExamsForProfile(exams: Exam[], context: StudentProfileContext): Exam[] {
  const { classLevel, stream } = context;

  const isBTechFinal =
    classLevel === 'BTech_Final' ||
    classLevel === 'B.Tech (4th Year)' ||
    classLevel === 'B.Tech 4th Year' ||
    classLevel === 'engineering-grad' ||
    (classLevel === 'Graduate' && stream === 'PCM') ||
    classLevel === 'BTech';

  const isAnyGraduate =
    isBTechFinal ||
    classLevel === 'Graduate' ||
    classLevel === 'Undergraduate' ||
    classLevel === 'Postgraduate';

  const isClass10 = classLevel === '10' || classLevel === 'Class 10th';
  const isClass12 = classLevel === '12' || classLevel === 'Class 12th';
  const isPolytechnic = classLevel === 'Polytechnic' || classLevel === 'Diploma';

  return exams.filter((exam) => {
    const slug = exam.slug.toLowerCase();
    const title = exam.title.toLowerCase();
    const elig = (exam.eligibility_criteria || '').toLowerCase();
    const cat = (exam.category_id || '').toLowerCase();

    // 1. If student is B.Tech 4th Year / Engineering Graduate
    if (isBTechFinal) {
      // Must NOT show 10th or 12th school board exams or initial school entrance tests
      if (
        slug.includes('cbse-class') ||
        slug.includes('mp-board') ||
        slug.includes('neet-ug') ||
        slug.includes('jee-main') ||
        slug.includes('upsc-nda')
      ) {
        return false;
      }

      // HIGH PRIORITY: GATE, CAT, SSC CGL, SSC JE, UPSC CSE, IBPS PO, UPSC CDS, MPPSC
      if (
        slug.includes('gate') ||
        slug.includes('ssc-je') ||
        slug.includes('cat') ||
        slug.includes('ssc-cgl') ||
        slug.includes('upsc-cse') ||
        slug.includes('ibps-po') ||
        slug.includes('upsc-cds') ||
        slug.includes('mppsc') ||
        slug.includes('ugc-net')
      ) {
        return true;
      }

      return elig.includes('graduate') || elig.includes('bachelor') || elig.includes('degree') || elig.includes('b.tech');
    }

    // 2. If student is Any Graduate (B.A., B.Sc., B.Com., etc.)
    if (isAnyGraduate) {
      if (
        slug.includes('cbse-class') ||
        slug.includes('mp-board') ||
        slug.includes('neet-ug') ||
        slug.includes('jee-main') ||
        slug.includes('upsc-nda')
      ) {
        return false;
      }

      if (
        slug.includes('upsc-cse') ||
        slug.includes('ssc-cgl') ||
        slug.includes('ibps-po') ||
        slug.includes('cat') ||
        slug.includes('upsc-cds') ||
        slug.includes('mppsc') ||
        slug.includes('ugc-net')
      ) {
        return true;
      }

      return elig.includes('graduate') || elig.includes('bachelor') || elig.includes('degree');
    }

    // 3. If student is Class 10th
    if (isClass10) {
      if (
        slug.includes('cbse-class-10') ||
        slug.includes('mp-board-10th')
      ) {
        return true;
      }
      return false;
    }

    // 4. If student is Class 12th
    if (isClass12) {
      // Exclude Post-Graduation only exams
      if (
        slug.includes('gate') ||
        slug.includes('cat-2027') ||
        slug.includes('ssc-cgl') ||
        slug.includes('ibps-po') ||
        slug.includes('upsc-cds') ||
        slug.includes('ugc-net')
      ) {
        return false;
      }

      if (stream === 'PCB') {
        return slug.includes('neet-ug') || slug.includes('cuet-ug') || slug.includes('cbse-class-12') || slug.includes('mp-board-12th') || slug.includes('ssc-chsl');
      }

      if (stream === 'PCM') {
        return slug.includes('jee-main') || slug.includes('upsc-nda') || slug.includes('cuet-ug') || slug.includes('cbse-class-12') || slug.includes('mp-board-12th') || slug.includes('ssc-chsl');
      }

      if (stream === 'Commerce') {
        return slug.includes('clat-ug') || slug.includes('cuet-ug') || slug.includes('cbse-class-12') || slug.includes('mp-board-12th') || slug.includes('ssc-chsl');
      }

      if (stream === 'Arts/Humanities') {
        return slug.includes('clat-ug') || slug.includes('cuet-ug') || slug.includes('cbse-class-12') || slug.includes('mp-board-12th') || slug.includes('ssc-chsl');
      }

      return true;
    }

    // 5. If Polytechnic Diploma
    if (isPolytechnic) {
      if (slug.includes('ssc-je') || slug.includes('ssc-chsl')) {
        return true;
      }
      return false;
    }

    return true;
  });
}

/**
 * Filters opportunities (Jobs, Scholarships, Internships) for the student profile
 */
export function filterOpportunitiesForProfile(opps: Opportunity[], context: StudentProfileContext): Opportunity[] {
  const { classLevel, stream } = context;

  const isBTechOrGraduate =
    classLevel === 'BTech_Final' ||
    classLevel === 'B.Tech (4th Year)' ||
    classLevel === 'B.Tech 4th Year' ||
    classLevel === 'engineering-grad' ||
    classLevel === 'Graduate' ||
    classLevel === 'Undergraduate';

  return opps.filter((opp) => {
    const slug = opp.slug.toLowerCase();
    const type = opp.opp_type;
    const qual = (opp.qualification || '').toLowerCase();
    const elig = (opp.eligibility || '').toLowerCase();

    if (isBTechOrGraduate) {
      // Highlight: NITI Aayog Internship (UG 2nd yr+ / PG), MEA Internship, SSC CHSL, SSC CGL
      if (slug.includes('niti-aayog') || slug.includes('mea-internship') || slug.includes('ssc')) {
        return true;
      }
      // For scholarships, show those open for UG/PG
      if (type === 'scholarship') {
        return qual.includes('ug') || qual.includes('degree') || qual.includes('graduate');
      }
      return true;
    }

    // For Class 10 / 12 students
    if (classLevel === '10' || classLevel === '12') {
      if (slug.includes('mea-internship')) return false; // Graduate only
      return true;
    }

    return true;
  });
}
