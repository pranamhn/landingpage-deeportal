"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useParams } from "next/navigation";

interface RegionData {
  code: string;
  population?: number;
  hdi?: number;
  poverty?: number;
  unemployment?: number;
  gini?: number;
}

const PROV_NAMES: Record<string, string> = {
  "11": "Aceh", "12": "Sumatera Utara", "13": "Sumatera Barat", "14": "Riau", "15": "Jambi", "16": "Sumatera Selatan", "17": "Bengkulu", "18": "Lampung", "19": "Babel", "21": "Kepri", "31": "DKI Jakarta", "32": "Jawa Barat", "33": "Jawa Tengah", "34": "DIY", "35": "Jawa Timur", "36": "Banten", "51": "Bali", "52": "NTB", "53": "NTT", "61": "Kalbar", "62": "Kalteng", "63": "Kalsel", "64": "Kaltim", "65": "Kaltara", "71": "Sulut", "72": "Sulteng", "73": "Sulsel", "74": "Sultra", "75": "Gorontalo", "76": "Sulbar", "81": "Maluku", "82": "Malut", "91": "Papua", "92": "Papua Barat",
};

const CITY_NAMES: Record<string, string> = { "1101": "Simeulue", "1102": "Aceh Singkil", "1103": "Aceh Selatan", "1104": "Aceh Tenggara", "1105": "Aceh Timur", "1106": "Aceh Tengah", "1107": "Aceh Barat", "1108": "Aceh Besar", "1109": "Pidie", "1110": "Bireuen", "1111": "Aceh Utara", "1112": "Aceh Barat Daya", "1113": "Gayo Lues", "1114": "Aceh Tamiang", "1115": "Nagan Raya", "1116": "Aceh Jaya", "1117": "Bener Meriah", "1118": "Pidie Jaya", "1171": "Banda Aceh", "1172": "Sabang", "1173": "Langsa", "1174": "Lhokseumawe", "1175": "Subulussalam", "1201": "Nias", "1202": "Mandailing Natal", "1203": "Tapanuli Selatan", "1204": "Tapanuli Tengah", "1205": "Tapanuli Utara", "1206": "Toba Samosir", "1207": "Labuhan Batu", "1208": "Asahan", "1209": "Simalungun", "1210": "Dairi", "1211": "Karo", "1212": "Deli Serdang", "1213": "Langkat", "1214": "Nias Selatan", "1215": "Humbang Hasundutan", "1216": "Pakpak Bharat", "1217": "Samosir", "1218": "Serdang Bedagai", "1219": "Batu Bara", "1220": "Padang Lawas Utara", "1221": "Padang Lawas", "1222": "Labuhan Batu Selatan", "1223": "Labuhan Batu Utara", "1224": "Nias Utara", "1225": "Nias Barat", "1271": "Sibolga", "1272": "Tanjung Balai", "1273": "Pematangsiantar", "1274": "Tebing Tinggi", "1275": "Medan", "1276": "Binjai", "1277": "Padang Sidempuan", "1278": "Gunungsitoli", "1301": "Kepulauan Mentawai", "1302": "Pesisir Selatan", "1303": "Solok", "1304": "Sijunjung", "1305": "Tanah Datar", "1306": "Padang Pariaman", "1307": "Agam", "1308": "Lima Puluh Kota", "1309": "Pasaman", "1310": "Solok Selatan", "1311": "Dharmasraya", "1312": "Pasaman Barat", "1371": "Padang", "1372": "Solok", "1373": "Sawah Lunto", "1374": "Padang Panjang", "1375": "Bukittinggi", "1376": "Payakumbuh", "1377": "Pariaman", "1401": "Kuantan Singingi", "1402": "Indragiri Hulu", "1403": "Indragiri Hilir", "1404": "Pelalawan", "1405": "S I A K", "1406": "Kampar", "1407": "Rokan Hulu", "1408": "Bengkalis", "1409": "Rokan Hilir", "1410": "Kepulauan Meranti", "1471": "Pekanbaru", "1473": "D U M A I", "1501": "Kerinci", "1502": "Merangin", "1503": "Sarolangun", "1504": "Batang Hari", "1505": "Muaro Jambi", "1506": "Tanjung Jabung Timur", "1507": "Tanjung Jabung Barat", "1508": "Tebo", "1509": "Bungo", "1571": "Jambi", "1572": "Sungai Penuh", "1601": "Ogan Komering Ulu", "1602": "Ogan Komering Ilir", "1603": "Muara Enim", "1604": "Lahat", "1605": "Musi Rawas", "1606": "Musi Banyuasin", "1607": "Banyu Asin", "1608": "Ogan Komering Ulu Selatan", "1609": "Ogan Komering Ulu Timur", "1610": "Ogan Ilir", "1611": "Empat Lawang", "1612": "Penukal Abab Lematang Ilir", "1613": "Musi Rawas Utara", "1671": "Palembang", "1672": "Prabumulih", "1673": "Pagar Alam", "1674": "Lubuklinggau", "1701": "Bengkulu Selatan", "1702": "Rejang Lebong", "1703": "Bengkulu Utara", "1704": "Kaur", "1705": "Seluma", "1706": "Mukomuko", "1707": "Lebong", "1708": "Kepahiang", "1709": "Bengkulu Tengah", "1771": "Bengkulu", "1801": "Lampung Barat", "1802": "Tanggamus", "1803": "Lampung Selatan", "1804": "Lampung Timur", "1805": "Lampung Tengah", "1806": "Lampung Utara", "1807": "Way Kanan", "1808": "Tulangbawang", "1809": "Pesawaran", "1810": "Pringsewu", "1811": "Mesuji", "1812": "Tulang Bawang Barat", "1813": "Pesisir Barat", "1871": "Bandar Lampung", "1872": "Metro", "1901": "Bangka", "1902": "Belitung", "1903": "Bangka Barat", "1904": "Bangka Tengah", "1905": "Bangka Selatan", "1906": "Belitung Timur", "1971": "Pangkalpinang", "2101": "Karimun", "2102": "Bintan", "2103": "Natuna", "2104": "Lingga", "2105": "Kepulauan Anambas", "2171": "B A T A M", "2172": "Tanjung Pinang", "3101": "Kepulauan Seribu", "3171": "Jakarta Selatan", "3172": "Jakarta Timur", "3173": "Jakarta Pusat", "3174": "Jakarta Barat", "3175": "Jakarta Utara", "3201": "Bogor", "3202": "Sukabumi", "3203": "Cianjur", "3204": "Bandung", "3205": "Garut", "3206": "Tasikmalaya", "3207": "Ciamis", "3208": "Kuningan", "3209": "Cirebon", "3210": "Majalengka", "3211": "Sumedang", "3212": "Indramayu", "3213": "Subang", "3214": "Purwakarta", "3215": "Karawang", "3216": "Bekasi", "3217": "Bandung Barat", "3218": "Pangandaran", "3271": "Bogor", "3272": "Sukabumi", "3273": "Bandung", "3274": "Cirebon", "3275": "Bekasi", "3276": "Depok", "3277": "Cimahi", "3278": "Tasikmalaya", "3279": "Banjar", "3301": "Cilacap", "3302": "Banyumas", "3303": "Purbalingga", "3304": "Banjarnegara", "3305": "Kebumen", "3306": "Purworejo", "3307": "Wonosobo", "3308": "Magelang", "3309": "Boyolali", "3310": "Klaten", "3311": "Sukoharjo", "3312": "Wonogiri", "3313": "Karanganyar", "3314": "Sragen", "3315": "Grobogan", "3316": "Blora", "3317": "Rembang", "3318": "Pati", "3319": "Kudus", "3320": "Jepara", "3321": "Demak", "3322": "Semarang", "3323": "Temanggung", "3324": "Kendal", "3325": "Batang", "3326": "Pekalongan", "3327": "Pemalang", "3328": "Tegal", "3329": "Brebes", "3371": "Magelang", "3372": "Surakarta", "3373": "Salatiga", "3374": "Semarang", "3375": "Pekalongan", "3376": "Tegal", "3401": "Kulon Progo", "3402": "Bantul", "3403": "Gunung Kidul", "3404": "Sleman", "3471": "Yogyakarta", "3501": "Pacitan", "3502": "Ponorogo", "3503": "Trenggalek", "3504": "Tulungagung", "3505": "Blitar", "3506": "Kediri", "3507": "Malang", "3508": "Lumajang", "3509": "Jember", "3510": "Banyuwangi", "3511": "Bondowoso", "3512": "Situbondo", "3513": "Probolinggo", "3514": "Pasuruan", "3515": "Sidoarjo", "3516": "Mojokerto", "3517": "Jombang", "3518": "Nganjuk", "3519": "Madiun", "3520": "Magetan", "3521": "Ngawi", "3522": "Bojonegoro", "3523": "Tuban", "3524": "Lamongan", "3525": "Gresik", "3526": "Bangkalan", "3527": "Sampang", "3528": "Pamekasan", "3529": "Sumenep", "3571": "Kediri", "3572": "Blitar", "3573": "Malang", "3574": "Probolinggo", "3575": "Pasuruan", "3576": "Mojokerto", "3577": "Madiun", "3578": "Surabaya", "3579": "Batu", "3601": "Pandeglang", "3602": "Lebak", "3603": "Tangerang", "3604": "Serang", "3671": "Tangerang", "3672": "Cilegon", "3673": "Serang", "3674": "Tangerang Selatan", "5101": "Jembrana", "5102": "Tabanan", "5103": "Badung", "5104": "Gianyar", "5105": "Klungkung", "5106": "Bangli", "5107": "Karangasem", "5108": "Buleleng", "5171": "Denpasar", "5201": "Lombok Barat", "5202": "Lombok Tengah", "5203": "Lombok Timur", "5204": "Sumbawa", "5205": "Dompu", "5206": "Bima", "5207": "Sumbawa Barat", "5208": "Lombok Utara", "5271": "Mataram", "5272": "Bima", "5301": "Sumba Barat", "5302": "Sumba Timur", "5303": "Kupang", "5304": "Timor Tengah Selatan", "5305": "Timor Tengah Utara", "5306": "Belu", "5307": "Alor", "5308": "Lembata", "5309": "Flores Timur", "5310": "Sikka", "5311": "Ende", "5312": "Ngada", "5313": "Manggarai", "5314": "Rote Ndao", "5315": "Manggarai Barat", "5316": "Sumba Tengah", "5317": "Sumba Barat Daya", "5318": "Nagekeo", "5319": "Manggarai Timur", "5320": "Sabu Raijua", "5321": "Malaka", "5371": "Kupang", "6101": "Sambas", "6102": "Bengkayang", "6103": "Landak", "6104": "Mempawah", "6105": "Sanggau", "6106": "Ketapang", "6107": "Sintang", "6108": "Kapuas Hulu", "6109": "Sekadau", "6110": "Melawi", "6111": "Kayong Utara", "6112": "Kubu Raya", "6171": "Pontianak", "6172": "Singkawang", "6201": "Kotawaringin Barat", "6202": "Kotawaringin Timur", "6203": "Kapuas", "6204": "Barito Selatan", "6205": "Barito Utara", "6206": "Sukamara", "6207": "Lamandau", "6208": "Seruyan", "6209": "Katingan", "6210": "Pulang Pisau", "6211": "Gunung Mas", "6212": "Barito Timur", "6213": "Murung Raya", "6271": "Palangka Raya", "6301": "Tanah Laut", "6302": "Kotabaru", "6303": "Banjar", "6304": "Barito Kuala", "6305": "Tapin", "6306": "Hulu Sungai Selatan", "6307": "Hulu Sungai Tengah", "6308": "Hulu Sungai Utara", "6309": "Tabalong", "6310": "Tanah Bumbu", "6311": "Balangan", "6371": "Banjarmasin", "6372": "Banjar Baru", "6401": "Paser", "6402": "Kutai Barat", "6403": "Kutai Kartanegara", "6404": "Kutai Timur", "6405": "Berau", "6409": "Penajam Paser Utara", "6411": "Mahakam Hulu", "6471": "Balikpapan", "6472": "Samarinda", "6474": "Bontang", "6501": "Malinau", "6502": "Bulungan", "6503": "Tana Tidung", "6504": "Nunukan", "6571": "Tarakan", "7101": "Bolaang Mongondow", "7102": "Minahasa", "7103": "Kepulauan Sangihe", "7104": "Kepulauan Talaud", "7105": "Minahasa Selatan", "7106": "Minahasa Utara", "7107": "Bolaang Mongondow Utara", "7108": "Siau Tagulandang Biaro", "7109": "Minahasa Tenggara", "7110": "Bolaang Mongondow Selatan", "7111": "Bolaang Mongondow Timur", "7171": "Manado", "7172": "Bitung", "7173": "Tomohon", "7174": "Kotamobagu", "7201": "Banggai Kepulauan", "7202": "Banggai", "7203": "Morowali", "7204": "Poso", "7205": "Donggala", "7206": "Toli-Toli", "7207": "Buol", "7208": "Parigi Moutong", "7209": "Tojo Una-Una", "7210": "Sigi", "7211": "Banggai Laut", "7212": "Morowali Utara", "7271": "Palu", "7301": "Kepulauan Selayar", "7302": "Bulukumba", "7303": "Bantaeng", "7304": "Jeneponto", "7305": "Takalar", "7306": "Gowa", "7307": "Sinjai", "7308": "Maros", "7309": "Pangkajene Dan Kepulauan", "7310": "Barru", "7311": "Bone", "7312": "Soppeng", "7313": "Wajo", "7314": "Sidenreng Rappang", "7315": "Pinrang", "7316": "Enrekang", "7317": "Luwu", "7318": "Tana Toraja", "7322": "Luwu Utara", "7325": "Luwu Timur", "7326": "Toraja Utara", "7371": "Makassar", "7372": "Parepare", "7373": "Palopo", "7401": "Buton", "7402": "Muna", "7403": "Konawe", "7404": "Kolaka", "7405": "Konawe Selatan", "7406": "Bombana", "7407": "Wakatobi", "7408": "Kolaka Utara", "7409": "Buton Utara", "7410": "Konawe Utara", "7411": "Kolaka Timur", "7412": "Konawe Kepulauan", "7413": "Muna Barat", "7414": "Buton Tengah", "7415": "Buton Selatan", "7471": "Kendari", "7472": "Baubau", "7501": "Boalemo", "7502": "Gorontalo", "7503": "Pohuwato", "7504": "Bone Bolango", "7505": "Gorontalo Utara", "7571": "Gorontalo", "7601": "Majene", "7602": "Polewali Mandar", "7603": "Mamasa", "7604": "Mamuju", "7605": "Pasangkayu", "7606": "Mamuju Tengah", "8101": "Kepulauan Tanimbar", "8102": "Maluku Tenggara", "8103": "Maluku Tengah", "8104": "Buru", "8105": "Kepulauan Aru", "8106": "Seram Bagian Barat", "8107": "Seram Bagian Timur", "8108": "Maluku Barat Daya", "8109": "Buru Selatan", "8171": "Ambon", "8172": "Tual", "8201": "Halmahera Barat", "8202": "Halmahera Tengah", "8203": "Kepulauan Sula", "8204": "Halmahera Selatan", "8205": "Halmahera Utara", "8206": "Halmahera Timur", "8207": "Pulau Morotai", "8208": "Pulau Taliabu", "8271": "Ternate", "8272": "Tidore Kepulauan", "9101": "Fakfak", "9102": "Kaimana", "9103": "Teluk Wondama", "9104": "Teluk Bintuni", "9105": "Manokwari", "9106": "Sorong Selatan", "9107": "Sorong", "9108": "Raja Ampat", "9109": "Tambrauw", "9110": "Maybrat", "9111": "Manokwari Selatan", "9112": "Pegunungan Arfak", "9171": "Sorong", "9401": "Merauke", "9402": "Jayawijaya", "9403": "Jayapura", "9404": "Nabire", "9408": "Kepulauan Yapen", "9409": "Biak Numfor", "9410": "Paniai", "9411": "Puncak Jaya", "9412": "Mimika", "9413": "Boven Digoel", "9414": "Mappi", "9415": "Asmat", "9416": "Yahukimo", "9417": "Pegunungan Bintang", "9418": "Tolikara", "9419": "Sarmi", "9420": "Keerom", "9426": "Waropen", "9427": "Supiori", "9428": "Mamberamo Raya", "9429": "Nduga", "9430": "Lanny Jaya", "9431": "Mamberamo Tengah", "9432": "Yalimo", "9433": "Puncak", "9434": "Dogiyai", "9435": "Intan Jaya", "9436": "Deiyai", "9471": "Jayapura" };

function formatPop(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

export default function RegionProfilePage() {
  const { regionCode } = useParams<{ regionCode: string }>();
  const [region, setRegion] = useState<RegionData | null>(null);
  const [kabupaten, setKabupaten] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/population/summary").then(r => r.json()),
      fetch(`/api/v1/population/${regionCode}/kabupaten`).then(r => r.json()),
    ]).then(([provData, kabData]) => {
      if (provData.success) {
        const found = provData.data.find((r: RegionData) => r.code === regionCode);
        setRegion(found || null);
      }
      if (kabData.success) {
        setKabupaten(kabData.data.sort((a: RegionData, b: RegionData) => (b.population || 0) - (a.population || 0)));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [regionCode]);

  if (loading) {
    return <div><p className="eyebrow">Population</p><h1 className="font-display text-display-page font-bold">Loading...</h1></div>;
  }

  const name = PROV_NAMES[regionCode] || regionCode;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="eyebrow">Population</p>
          <h1 className="font-display text-display-page font-bold">{name}</h1>
          <p className="mt-1 text-muted">
            Population: {region?.population ? formatPop(region.population) : "-"}{" "}
            &middot; HDI: {region?.hdi !== undefined ? (region.hdi / 100).toFixed(2) : "-"}{" "}
            &middot; Poverty: {region?.poverty !== undefined ? region.poverty + "%" : "-"}
          </p>
        </div>
        <Link href="/population"><Button variant="outline">All Regions</Button></Link>
      </div>

      {/* Province Stats */}
      <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Population", value: region?.population ? formatPop(region.population) : "-" },
          { label: "HDI", value: region?.hdi !== undefined ? (region.hdi / 100).toFixed(2) : "-" },
          { label: "Poverty Rate", value: region?.poverty !== undefined ? region.poverty + "%" : "-" },
          { label: "Unemployment", value: region?.unemployment !== undefined ? region.unemployment + "%" : "-" },
        ].map((item) => (
          <Card key={item.label} className="text-center">
            <p className="text-3xl font-bold text-brand-700">{item.value}</p>
            <p className="mt-1 text-sm text-muted">{item.label}</p>
          </Card>
        ))}
      </div>

      {/* Kabupaten/Kota List */}
      <div className="mb-6">
        <h2 className="font-display text-heading-section font-bold text-gray-800">
          Kabupaten/Kota ({kabupaten.length})
        </h2>
        <p className="text-sm text-muted">Population data from BPS SP2020 census</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {kabupaten.map((kab) => (
          <Card key={kab.code} className="transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{CITY_NAMES[kab.code] || kab.code}</h3>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted">Pop.</span> <span className="font-semibold">{kab.population ? formatPop(kab.population) : "-"}</span></div>
              <div><span className="text-muted">HDI</span> <span className="font-semibold">{kab.hdi ?? "-"}</span></div>
            </div>
          </Card>
        ))}
      </div>

      {kabupaten.length === 0 && !loading && (
        <p className="py-8 text-center text-muted">No kabupaten data available for this province.</p>
      )}

      <div className="mt-8 text-center">
        <Badge variant="neutral">Source: BPS 2020 Census &middot; SP2020</Badge>
      </div>
    </div>
  );
}
