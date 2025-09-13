"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  fetchChapter,
  fetchChapterTopics,
  fetchQuestionBychapter,
} from "@/utils/api";
import axios from "axios";
import CommonLoader from "@/commonLoader";
import { FiInfo } from "react-icons/fi";

export default function Chapter({
  selectedSubject,
  onChapterSelect,
  onScreenSelection,
  searchTerm = "",
}) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // keep chapter colors stable across filters
  const colorCacheRef = useRef({}); // { [chapterId]: {rgb, r,g,b, buttonTextColor} }

  useEffect(() => {
    if (!selectedSubject?.id) return;

    const loadChapters = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchChapter(selectedSubject.id);
        if (!Array.isArray(data))
          throw new Error("Invalid data format received");

        const allChapters = await Promise.all(
          data.map(async (chapter) => {
            let topicCount = 0;
            let questionCount = 0;

            try {
              const topics = await fetchChapterTopics(chapter.id);
              topicCount = Array.isArray(topics) ? topics.length : 0;
            } catch (topicError) {
              if (
                axios.isAxiosError(topicError) &&
                topicError.response?.status === 404
              ) {
                topicCount = 0;
              } else {
                console.error(
                  `Error fetching topics for chapter ${chapter.id}:`,
                  topicError
                );
                topicCount = "N/A";
              }
            }

            try {
              const questionsResponse = await fetchQuestionBychapter(
                chapter.id
              );
              if (Array.isArray(questionsResponse?.data)) {
                questionCount = questionsResponse.data.length;
              } else if (Array.isArray(questionsResponse)) {
                questionCount = questionsResponse.length;
              } else {
                questionCount = 0;
              }
            } catch (questionError) {
              if (
                axios.isAxiosError(questionError) &&
                questionError.response?.status === 404
              ) {
                questionCount = 0;
              } else {
                console.error(
                  `Error fetching questions for chapter ${chapter.id}:`,
                  questionError
                );
                questionCount = "N/A";
              }
            }

            // stable color per chapter
            if (!colorCacheRef.current[chapter.id]) {
              const darkColor = getRandomDarkColor();
              const contrastColor = getContrastColor(
                darkColor.r,
                darkColor.g,
                darkColor.b
              );
              colorCacheRef.current[chapter.id] = {
                randomBgColor: darkColor.rgb,
                buttonTextColor: contrastColor,
              };
            }

            return {
              ...chapter,
              topicCount,
              questionCount,
              ...colorCacheRef.current[chapter.id],
            };
          })
        );

        const chaptersWithQuestions = allChapters.filter(
          (c) => c.questionCount > 0 && c.questionCount !== "N/A"
        );

        setChapters(chaptersWithQuestions);

        if (chaptersWithQuestions.length === 0) {
          setError("No chapters with questions found in this subject.");
        }
      } catch (err) {
        console.error("Failed to fetch chapters:", err);
        setError(
          "There are no chapters added in this subject yet. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    loadChapters();
  }, [selectedSubject]);

  // filter by searchTerm (name only, case-insensitive)
  const filteredChapters = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return chapters;
    return chapters.filter((c) =>
      String(c.name || "")
        .toLowerCase()
        .includes(term)
    );
  }, [chapters, searchTerm]);

  const handleTopicClick = (chapter) => {
    onChapterSelect(chapter);
    onScreenSelection("topic");
  };

  const handleQuestionTypeClick = (chapter) => {
    onChapterSelect(chapter);
    onScreenSelection("questiontype");
  };

  const getRandomDarkColor = () => {
    const r = Math.floor(Math.random() * 90 + 30);
    const g = Math.floor(Math.random() * 90 + 30);
    const b = Math.floor(Math.random() * 90 + 30);
    return { r, g, b, rgb: `rgb(${r}, ${g}, ${b})` };
  };

  const getContrastColor = (r, g, b) => {
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 128 ? "#000000" : "#FFFFFF";
  };

  const chapterImage = {
    // bilogy
    "The Living World": {
      image: "/images/chapterImg/B11.1-Living-World.svg",
    },
    "Biological Classification": {
      image: "/images/chapterImg/B11.2-Biological-Classification.svg",
    },
    "Plant Kingdom": {
      image: "/images/chapterImg/B11.3-Plant-Kingdom.svg",
    },
    "Animal Kingdom": {
      image: "/images/chapterImg/B11.4-Animal-Kingdom.svg",
    },
    "Morphology of Flowering Plants": {
      image: "/images/chapterImg/B11.5-Morphology-of-Flowering-plants.svg",
    },
    "Anatomy of Flowering Plants": {
      image: "/images/chapterImg/B11.6-Anatomy-of-Flowering-Plants-01.svg",
    },

    "Cell: The Unit of Life": {
      image: "/images/chapterImg/B11.8-Cell-Unit-of-Life.svg",
    },
    "Cell Cycle & Cell Division": {
      image: "/images/chapterImg/B11.9-Cell-Cycle-&-Cell-Division.svg",
    },
    "Anatomy of Flowering Plants": {
      image: "/images/chapterImg/B11.10-Biomolecule.svg",
    },
    "Photosynthesis in Higher Plants": {
      image: "/images/chapterImg/B11.11-Photosynthesis.svg",
    },
    "Respiration in Plants": {
      image: "/images/chapterImg/B11.12-Respiration-in-Plants.svg",
    },
    "Plant Growth & Development": {
      image: "/images/chapterImg/B11.13-Plant-Growth-&-Development.svg",
    },
    "Breathing & Exchange of Gases": {
      image: "/images/chapterImg/B11.14-Breathing-&-Exchange.svg",
    },
    "Body Fluids & Circulation": {
      image: "/images/chapterImg/B11.15-Body-Fluids-&-Circulation.svg",
    },
    "Excretory Products & Their Elimination": {
      image: "/images/chapterImg/B11.16-Excretory-Products.svg",
    },
    "Locomotion and Movement": {
      image: "/images/chapterImg/B11.17-Locomotion.svg",
    },
    "Neural Control & Coordination": {
      image: "/images/chapterImg/B11.18-Neural-Control.svg",
    },
    "Chemical Coordination & Integration": {
      image: "/images/chapterImg/B11.19-Chemical-Control.svg",
    },
    "Structural Organisation in Animals": {
      image: "/images/chapterImg/B11.7-Structural-Organisation.svg",
    },
    "Human Reproduction": {
      image: "/images/chapterImg/B12.2-Human-Reproduction.svg",
    },

    "Reproductive Health": {
      image: "/images/chapterImg/B12.3-Reproductive-Health.svg",
    },
    "Principles of Inheritance & Variation": {
      image: "/images/chapterImg/B12.4-Principles-of-Inheritance.svg",
    },
    "Molecular Basis of Inheritance": {
      image: "/images/chapterImg/B12.5-Molecular-Basis-of-inheritance.svg",
    },
    "Evolution": {
      image: "/images/chapterImg/B12.6-Evolution.svg",
    },
    "Human Health and Disease": {
      image: "/images/chapterImg/B12.7-Human-Health-&-Diseases.svg",
    },
    "Microbes in Human Welfare": {
      image: "/images/chapterImg/B12.8-Microbes-in-Human-Welfare.svg",
    },
    "Biotechnology: Principles & Processes": {
      image: "/images/chapterImg/B12.9-Biotechnology-Principles.svg",
    },
    "Biotechnology and its Application": {
      image: "/images/chapterImg/B12.10-Biotechnology-Applications.svg",
    },

    "Organism & Population": {
      image: "/images/chapterImg/B12.11-Organism-and-Populations.svg",
    },
    "Ecosystem": {
      image: "/images/chapterImg/B12.12-Ecosystem.svg",
    },
    "Biodiversity & Conservation": {
      image: "/images/chapterImg/B12.13-Biodiversity-and-Conservation.svg",
    },
    "Sexual Reproduction in Flowering Plants": {
      image:
        "/images/chapterImg/B12.1-Sexual-Reproduction-in-Flowering-Plants.svg",
    },

    // chemistry
    "Basics Concepts in Chemistry": {
      image: "/images/chapterImg/C11.1-Some-Basic-Concepts-of-Chemistry.svg",
    },
        "Atomic Structure": {
      image: "/images/chapterImg/C11.2-Structure-of-Atom.svg",
    },
        "Classification of Elements & Periodicity in Properties": {
      image: "/images/chapterImg/C11.3-Classification-of-Elements-and-Periodicity-in-Properties.svg",
    },
        "Chemical Bonding & Molecular Structure": {
      image: "/images/chapterImg/C11.4-Chemical-Bonding-and-Molecular-Structure.svg",
    },
        "Equilibrium": {
      image: "/images/chapterImg/C11.6-Equilibrium.svg",
    },
        "Hydrocarbons": {
      image: "/images/chapterImg/C11.9-Hydrocarbons.svg",
    },
        "Solutions": {
      image: "/images/chapterImg/C12.1-SOLUTIONS.svg",
    },
        "Electrochemistry": {
      image: "/images/chapterImg/C12.2-ELECTROCHEMISTRY.svg",
    },
        "Chemical Kinetics": {
      image: "/images/chapterImg/C12.3-CHEMICAL-KINETICS.svg",
    },
        "Haloalkanes & Haloarenes": {
      image: "/images/chapterImg/C12.6-Haloalkanes-and-Haloarenes.svg",
    },
        "Alcohols, Phenols & Ethers": {
      image: "/images/chapterImg/C12.7-Alcohols-Phenols-and-Ethers.svg",
    },
        "Aldehydes, Ketones & Carboxylic Acids": {
      image: "/images/chapterImg/C12.8-Aldehydes-Ketones-and-Carboxylic-Acids.svg",
    },
        "Amines": {
      image: "/images/chapterImg/C12.9-Amines.svg",
    },
        "Biomolecules": {
      image: "/images/chapterImg/C12.10-Biomolecules.svg",
    },
        "Thermodynamics": {
      image: "/images/chapterImg/C11.5-Thermodynamics.svg",
    },
        "Redox Reactions": {
      image: "/images/chapterImg/C11.7-Redox-Reactions.svg",
    },
        "General Organic Chemistry": {
      image: "/images/chapterImg/C11.8-General-Organic-Chemistry.svg",
    },
        "d & f Block": {
      image: "/images/chapterImg/C12.4-THE-d-AND-f-BLOCK-ELEMENTS.svg",
    },
        "Coordination Compounds": {
      image: "/images/chapterImg/C12.5-COORDINATION-COMPOUNDS.svg",
    },

    // physics
    "Units and Measurements": {
      image: "/images/chapterImg/P11.1-Units-&-Measurement.svg", 
    },
        "Motion in a Straight Line": {
      image: "/images/chapterImg/P11.2-Motion-in-A-Straight-Line.svg", 
    },
        "Motion in a Plane": {
      image: "/images/chapterImg/P11.3-Motion-in-a-Plane.svg", 
    },
        "Laws of Motion": {
      image: "/images/chapterImg/P11.4-Laws-of-Motion.svg", 
    },
        "Work, Power, Energy": {
      image: "/images/chapterImg/P11.5-Work-Energy-and-Power.svg", 
    },
        "System of Particles & Rotational Motion": {
      image: "/images/chapterImg/P11.6-System-of-Particles-and-Rotational-Motion.svg", 
    },
        "Gravitation": {
      image: "/images/chapterImg/P11.7-Gravitation.svg", 
    },
        "Mechanical Properties of Solids": {
      image: "/images/chapterImg/P11.8-Mechanical-Properties-of-Solids.svg", 
    },
        "Mechanical Properties of Fluids": {
      image: "/images/chapterImg/P11.9-Mechanical-Properties-of-Fluids.svg", 
    },
        "Thermal Properties of Matter": {
      image: "/images/chapterImg/P11.10-Thermal-Properties-of-Matter.svg", 
    },
        "Thermodynamics": {
      image: "/images/chapterImg/P11.11-Thermodynamics.svg", 
    },
        "Kinetic Theory": {
      image: "/images/chapterImg/P11.12-Kinetic-Theory.svg", 
    },
        "Oscillations": {
      image: "/images/chapterImg/P11.13-Oscillations.svg", 
    },
        "Waves": {
      image: "/images/chapterImg/P11.14-Waves.svg", 
    },
        "Electric Charges & Fields": {
      image: "/images/chapterImg/P12.1-ELECTRIC-CHARGES-AND-FIELDS.svg", 
    },

        "Electrostatic Potential & Capacitance": {
      image: "/images/chapterImg/P12.2-ELECTROSTATIC-POTENTIAL-AND-CAPACITANCE.svg", 
    },
        "Current Electricity": {
      image: "/images/chapterImg/P12.3-CURRENT-ELECTRICITY.svg", 
    },
        "Moving Charges & Magnetism": {
      image: "/images/chapterImg/P12.4-MOVING-CHARGES-AND-MAGNETISM.svg", 
    },
        "Magnetism & Matter": {
      image: "/images/chapterImg/P12.5-MAGNETISM-AND-MATTER.svg", 
    },
        "Electromagnetic Induction": {
      image: "/images/chapterImg/P12.6-ELECTROMAGNETIC-INDUCTION.svg", 
    },
        "Alternating Current": {
      image: "/images/chapterImg/P12.7-ALTERNATING-CURRENT.svg", 
    },
        "Electromagnetic Waves": {
      image: "/images/chapterImg/P12.8-ELECTROMAGNETIC-WAVES.svg", 
    },
        "Ray Optics": {
      image: "/images/chapterImg/P12.9-RAY-OPTICS-AND-OPTICAL-INSTRUMENTS-01.svg", 
    },
        "Wave Optics": {
      image: "/images/chapterImg/P12.10-WAVE-OPTICS.svg", 
    },
        "Dual Nature of Radiation & Matter": {
      image: "/images/chapterImg/P12.11-DUAL-NATURE-OF-RADIATION-AND-MATTER.svg", 
    },
        "Atoms": {
      image: "/images/chapterImg/P12.12-ATOMS.svg", 
    },
        "Nuclei": {
      image: "/images/chapterImg/P12.13-NUCLEI.svg", 
    },
        "Semiconductors Electronics": {
      image: "/images/chapterImg/P12.14-SEMICONDUCTOR-ELECTRONICS-MATERIALS-DEVICES-AND-SIMPLE-CIRCUITS.svg", 
    },
  };

  return (
    <div className="p-4 inside_practice">
      {loading && <CommonLoader />}
      {error && <p className="text-center pt-10">{error}</p>}

      <div className="mb-4">
        <div className="flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 p-3 md:p-4">
          {/* Icon */}
          <div className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-purple-600">
            <FiInfo className="h-5 w-5 text-white" />
          </div>

          {/* Text */}
          <p className="text-sm md:text-base text-purple-900">
            <span className="font-semibold">Key Info:</span> Each information in
            NCERT is framed in{" "}
            <span className="font-semibold">10+ different question types</span>.
          </p>
        </div>
      </div>

      {!loading && !error && (
        <>
          {/* When search is active but nothing matches */}
          {filteredChapters.length === 0 ? (
            <p className="text-center pt-10">No chapters match your search.</p>
          ) : (
            <div className="chapter_cards">
              {filteredChapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="subject_card"
                  style={{ backgroundColor: chapter.randomBgColor }}
                >
                  <div className="chapter-card-inner">
                    <div>
                      <h2>{chapter.name}</h2>
                      <div className="text-sm gap-2 text-white">
                        <span className="text-white mr-1">
                          {chapter.topicCount} Topics
                        </span>{" "}&amp;<span className="text-white ml-1">
                          {chapter.questionCount} Questions
                        </span>
                      </div>
                    </div>
                    <div>
                      <img
                        src={
                          chapterImage[chapter.name]?.image ||
                          "/images/practice/default.png"
                        }
                        alt={chapter.name}
                      />
                    </div>
                  </div>
                  <div className="btns_group">
                    <button
                      onClick={() => handleTopicClick(chapter)}
                      className="mt-4 px-4 py-2 rounded-full font-semibold bg-white transition-transform duration-100 ease-in-out hover:-translate-y-[1px]"
                      style={{ color: chapter.randomBgColor }}
                    >
                      Attempt by Topics
                    </button>
                    <button
                      onClick={() => handleQuestionTypeClick(chapter)}
                      className="px-4 py-2 mt-3 md:mt-1 rounded-full font-semibold bg-white transition-transform duration-100 ease-in-out hover:-translate-y-[1px]"
                      style={{ color: chapter.randomBgColor }}
                    >
                      Attempt by Question Type
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
